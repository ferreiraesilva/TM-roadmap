import os
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tm_roadmap.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

DIR_TYPE_MAP = {
    "initiatives": models.NodeType.INITIATIVE,
    "epics": models.NodeType.EPIC,
    "stories": models.NodeType.STORY,
    "bugs": models.NodeType.BUG,
    "decisions": models.NodeType.DECISION,
    "rfcs": models.NodeType.RFC,
    "spikes": models.NodeType.SPIKE,
}

CODE_REGEX = re.compile(r'([A-Z]+-\d{4})')

def normalize_status(status_str):
    """Canonical status vocabulary (English, exact values used everywhere
    else in the app -- see static/app.js:matchStatus): Backlog, To Do,
    Doing, Done, Canceled. This function maps whatever free-text status a
    markdown file has (English or Portuguese, various synonyms used across
    the repo's history) onto one of those five. "Accepted" -- the status
    every decision record uses -- maps to "To Do": an accepted decision has
    no more work pending on the decision record itself, but nothing has
    been executed/shipped yet either (that's tracked by separate
    story/task/epic records), so it belongs earlier than Done, not later.
    """
    if not status_str:
        return "Backlog"
    s = status_str.lower()
    if any(x in s for x in ["cancel"]):  # canceled / cancelled / cancelado
        return "Canceled"
    if any(x in s for x in ["done", "completed", "finalizado", "concluido", "concluído", "delivered", "entregue", "sucesso", "produção", "producao", "production"]):
        return "Done"
    if any(x in s for x in ["doing", "in progress", "active", "ativo", "progresso", "desenvolvimento", "development", "pilot", "piloto"]):
        return "Doing"
    if any(x in s for x in ["to do", "todo", "accepted", "aceito", "aceita", "pending", "pendente", "aprovação", "aprovacao", "approval"]):
        return "To Do"
    return "Backlog"  # draft, rascunho, or anything unrecognized

def map_filename_code_to_db_code(filename_code):
    if not filename_code:
        return None
    parts = filename_code.split('-')
    if len(parts) == 2:
        prefix, num = parts[0], parts[1]
        mapping = {
            "PRODUCT": "PR",
            "INITIATIVE": "IN",
            "EPIC": "EP",
            "STORY": "US",
            "BUG": "BUG",
            "RFC": "RFC",
            "DECISION": "DE",
            "SPIKE": "SP"
        }
        new_prefix = mapping.get(prefix.upper(), prefix)
        return f"{new_prefix}-{num}"
    return filename_code

def clean_title(title):
    pattern_type = re.compile(
        r'^(epic|bug|bugs|user story|story|initiative|iniciativa|rfc|decision|spike|spikes|stories|decisões)[\s\-\:\[\]\(\)\/]*',
        re.IGNORECASE
    )
    pattern_code = re.compile(
        r'^([a-z]+-\d+|\d+[\s\-\:\[\]\(\)\/]*|\[[a-z]+-\d+\]|\[\d+\])[\s\-\:\[\]\(\)\/]*',
        re.IGNORECASE
    )
    while True:
        new_title = title.strip()
        new_title = pattern_type.sub('', new_title).strip()
        new_title = pattern_code.sub('', new_title).strip()
        if new_title == title:
            break
        title = new_title
    return title

def parse_markdown_file(filepath, node_type):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    title = ""
    status_val = "Draft"
    product_val = "TrueMobile"  # Default fallback product
    description = content

    # Find title
    for line in lines:
        if line.strip().startswith('# '):
            title = line.strip('# ').strip()
            title = clean_title(title)
            break
    
    if not title:
        title = os.path.basename(filepath).replace('.md', '').replace('-', ' ').title()
        title = clean_title(title)

    # Extract Status
    status_match = re.search(r'## Status\s*\n\n?([^\n#]+)', content, re.IGNORECASE)
    if status_match:
        status_val = status_match.group(1).strip()
        if '(' in status_val:
            status_val = status_val.split('(')[0].strip()
    status_val = normalize_status(status_val)

    # Extract Product
    product_match = re.search(r'## Product\s*\n\n?([^\n#]+)', content, re.IGNORECASE)
    if product_match:
        product_val = product_match.group(1).strip()
        # Clean up inline notes
        if '(' in product_val:
            product_val = product_val.split('(')[0].strip()
        # Handle some common mappings/aliases
        if product_val.lower() == "minhaincorporadora":
            product_val = "MinhaIncorporadora"
        elif product_val.lower() == "taskme":
            product_val = "TaskMe"
        elif product_val.lower() == "semcontrole" or product_val.lower() == "sem controle":
            product_val = "SemControle"
        elif product_val.lower() == "concienciatm" or product_val.lower() == "conciencia tm":
            product_val = "ConcienciaTM"

    # Determine unique code
    filename = os.path.basename(filepath)
    code_match = CODE_REGEX.search(filename)
    code = code_match.group(1) if code_match else None

    return {
        "code": code,
        "title": title,
        "type": node_type,
        "status": status_val,
        "product": product_val,
        "description": description,
        "raw_content": content
    }

def main():
    db = SessionLocal()
    
    # First clear existing nodes
    db.query(models.Node).delete()
    db.commit()

    parsed_nodes = []
    
    # 1. Parse all files
    for dir_name, node_type in DIR_TYPE_MAP.items():
        dir_path = os.path.join(ROOT_DIR, dir_name)
        if not os.path.exists(dir_path):
            continue
            
        for file in os.listdir(dir_path):
            if file.endswith('.md'):
                filepath = os.path.join(dir_path, file)
                try:
                    node_data = parse_markdown_file(filepath, node_type)
                    parsed_nodes.append(node_data)
                except Exception as e:
                    print(f"Error parsing {filepath}: {e}")

    # Sort parsed_nodes: items with explicit code first, items without code last
    parsed_nodes.sort(key=lambda x: (0 if x["code"] else 1, x["code"] or ""))

    # 2. Insert Products first and map them
    products_db = {} # product_name -> db_node
    
    # Ensure default TrueMobile exists
    default_product = db.query(models.Node).filter(models.Node.title == "TrueMobile", models.Node.type == models.NodeType.PRODUCT).first()
    if not default_product:
        default_product = models.Node(
            id="PR-0001",
            title="TrueMobile",
            type=models.NodeType.PRODUCT,
            description="# TrueMobile Portfolio\nRoadmap central da organização.",
            status="Active"
        )
        db.add(default_product)
        db.commit()
        db.refresh(default_product)
    products_db["TrueMobile"] = default_product

    # Collect all unique products from parsed nodes
    unique_products = set(n["product"] for n in parsed_nodes if n["product"])
    for prod_name in unique_products:
        if prod_name not in products_db:
            max_prod = db.query(models.Node.id).filter(
                models.Node.type == models.NodeType.PRODUCT,
                models.Node.id.like("PR-%")
            ).order_by(models.Node.id.desc()).first()
            
            next_num = 1
            if max_prod and max_prod[0]:
                match = re.search(r'-(\d+)$', max_prod[0])
                if match:
                    next_num = int(match.group(1)) + 1
            
            prod_id = f"PR-{next_num:04d}"
            
            prod_node = models.Node(
                id=prod_id,
                title=prod_name,
                type=models.NodeType.PRODUCT,
                description=f"# {prod_name}\nRoadmap e backlog do produto {prod_name}.",
                status="Active"
            )
            db.add(prod_node)
            db.commit()
            db.refresh(prod_node)
            products_db[prod_name] = prod_node

    # 3. Insert other nodes (first pass, no parents yet)
    db_nodes_map = {} # code -> db_node
    
    for node_data in parsed_nodes:
        node_id = map_filename_code_to_db_code(node_data["code"])
        if not node_id:
            TYPE_PREFIX_MAP = {
                models.NodeType.PRODUCT: "PR",
                models.NodeType.INITIATIVE: "IN",
                models.NodeType.EPIC: "EP",
                models.NodeType.STORY: "US",
                models.NodeType.BUG: "BUG",
                models.NodeType.RFC: "RFC",
                models.NodeType.DECISION: "DE",
                models.NodeType.SPIKE: "SP"
            }
            prefix = TYPE_PREFIX_MAP.get(node_data["type"], "ITEM")
            max_node = db.query(models.Node.id).filter(
                models.Node.type == node_data["type"],
                models.Node.id.like(f"{prefix}-%")
            ).order_by(models.Node.id.desc()).first()
            
            next_num = 1
            if max_node and max_node[0]:
                match = re.search(r'-(\d+)$', max_node[0])
                if match:
                    next_num = int(match.group(1)) + 1
            
            node_id = f"{prefix}-{next_num:04d}"
            # Update node_data code so it maps correctly
            node_data["code"] = node_id

        db_node = models.Node(
            id=node_id,
            title=node_data["title"],
            type=node_data["type"],
            description=node_data["description"],
            status=node_data["status"]
        )
        db.add(db_node)
        db.commit()
        db.refresh(db_node)
        
        # Save reference
        key = node_data["code"] if node_data["code"] else node_data["title"].lower()
        db_nodes_map[key] = db_node

    # 4. Second pass: link parent-child relationships
    for node_data in parsed_nodes:
        key = node_data["code"] if node_data["code"] else node_data["title"].lower()
        db_node = db_nodes_map.get(key)
        if not db_node:
            continue

        raw_content = node_data["raw_content"]
        parent_id = None

        if node_data["type"] == models.NodeType.EPIC:
            # Look for Parent Initiative
            parent_match = re.search(r'## Parent Initiative\s*\n\n?([^\n#]+)', raw_content, re.IGNORECASE)
            if parent_match:
                parent_text = parent_match.group(1).strip()
                init_code_match = CODE_REGEX.search(parent_text)
                if init_code_match:
                    parent_code = init_code_match.group(1)
                    parent_node = db_nodes_map.get(parent_code)
                    if parent_node:
                        parent_id = parent_node.id
            
            # Fallback search for INITIATIVE-xxxx in content
            if not parent_id:
                for match in CODE_REGEX.finditer(raw_content):
                    ref_code = match.group(1)
                    if ref_code.startswith("INITIATIVE-"):
                        parent_node = db_nodes_map.get(ref_code)
                        if parent_node:
                            parent_id = parent_node.id
                            break

        elif node_data["type"] == models.NodeType.STORY:
            # Look for Related Epic
            parent_match = re.search(r'## Related Epic\s*\n\n?([^\n#]+)', raw_content, re.IGNORECASE)
            if parent_match:
                parent_text = parent_match.group(1).strip()
                epic_code_match = CODE_REGEX.search(parent_text)
                if epic_code_match:
                    parent_code = epic_code_match.group(1)
                    parent_node = db_nodes_map.get(parent_code)
                    if parent_node:
                        parent_id = parent_node.id
            
            # Fallback search for EPIC-xxxx in content
            if not parent_id:
                for match in CODE_REGEX.finditer(raw_content):
                    ref_code = match.group(1)
                    if ref_code.startswith("EPIC-"):
                        parent_node = db_nodes_map.get(ref_code)
                        if parent_node:
                            parent_id = parent_node.id
                            break
                            
        # If it's a decision, spike, rfc, or bug, check if it references an initiative or epic
        elif node_data["type"] in [models.NodeType.DECISION, models.NodeType.RFC, models.NodeType.SPIKE, models.NodeType.BUG]:
            for match in CODE_REGEX.finditer(raw_content):
                ref_code = match.group(1)
                # First try epic, then initiative
                if ref_code.startswith("EPIC-") or ref_code.startswith("INITIATIVE-"):
                    parent_node = db_nodes_map.get(ref_code)
                    if parent_node:
                        parent_id = parent_node.id
                        break

        # Set parent_id if found
        if parent_id:
            db_node.parent_id = parent_id
            db.commit()
            
    # 5. Third pass: fallback nodes with parent_id = None to their respective Product nodes
    for node_data in parsed_nodes:
        key = node_data["code"] if node_data["code"] else node_data["title"].lower()
        db_node = db_nodes_map.get(key)
        if not db_node:
            continue
            
        if db_node.parent_id is None:
            # Connect to its Product node
            prod_name = node_data["product"] or "TrueMobile"
            prod_node = products_db.get(prod_name, default_product)
            db_node.parent_id = prod_node.id
            db.commit()

    print(f"Successfully seeded {len(parsed_nodes)} nodes under {len(products_db)} products.")
    db.close()

if __name__ == "__main__":
    main()
