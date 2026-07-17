from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import os
import re

from database import get_db
import models

app = FastAPI(title="TM-Roadmap API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class NodeBase(BaseModel):
    title: str
    type: str
    description: Optional[str] = None
    status: Optional[str] = None
    parent_id: Optional[str] = None

class NodeCreate(NodeBase):
    pass

class NodeUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    parent_id: Optional[str] = None

class NodeResponse(NodeBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# For recursive tree representation
class NodeTreeResponse(BaseModel):
    id: str
    title: str
    type: str
    description: Optional[str] = None
    status: Optional[str] = None
    parent_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    children: List["NodeTreeResponse"] = []

    class Config:
        from_attributes = True

# Core API Routes
@app.post("/api/nodes", response_model=NodeResponse, status_code=status.HTTP_201_CREATED)
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    # Validate type
    try:
        node_type = models.NodeType(node.type.lower())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid node type. Allowed: {[t.value for t in models.NodeType]}"
        )
    
    # Validate parent if exists
    if node.parent_id:
        parent = db.query(models.Node).filter(models.Node.id == node.parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Parent node with id {node.parent_id} not found."
            )

    # Auto-generate code if node is not a product
    node_id = None
    TYPE_PREFIX_MAP = {
        "product": "PR",
        "initiative": "IN",
        "epic": "EP",
        "story": "US",
        "bug": "BUG",
        "rfc": "RFC",
        "decision": "DE",
        "spike": "SP"
    }
    
    if node_type.value in TYPE_PREFIX_MAP:
        prefix = TYPE_PREFIX_MAP[node_type.value]
        max_node = db.query(models.Node.id).filter(
            models.Node.type == node_type,
            models.Node.id.like(f"{prefix}-%")
        ).order_by(models.Node.id.desc()).first()
        
        next_num = 1
        if max_node and max_node[0]:
            match = re.search(r'-(\d+)$', max_node[0])
            if match:
                next_num = int(match.group(1)) + 1
        
        node_id = f"{prefix}-{next_num:04d}"
    else:
        node_id = node.title

    db_node = models.Node(
        id=node_id,
        title=node.title,
        type=node_type,
        description=node.description,
        status=node.status,
        parent_id=node.parent_id
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    
    # Return as NodeResponse (convert Enum to string)
    return NodeResponse(
        id=db_node.id,
        title=db_node.title,
        type=db_node.type.value,
        description=db_node.description,
        status=db_node.status,
        parent_id=db_node.parent_id,
        created_at=db_node.created_at,
        updated_at=db_node.updated_at
    )

@app.get("/api/nodes", response_model=List[NodeResponse])
def get_nodes(db: Session = Depends(get_db)):
    nodes = db.query(models.Node).all()
    return [
        NodeResponse(
            id=n.id,
            title=n.title,
            type=n.type.value,
            description=n.description,
            status=n.status,
            parent_id=n.parent_id,
            created_at=n.created_at,
            updated_at=n.updated_at
        ) for n in nodes
    ]

@app.get("/api/nodes/{node_id}", response_model=NodeResponse)
def get_node(node_id: str, db: Session = Depends(get_db)):
    db_node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")
    return NodeResponse(
        id=db_node.id,
        title=db_node.title,
        type=db_node.type.value,
        description=db_node.description,
        status=db_node.status,
        parent_id=db_node.parent_id,
        created_at=db_node.created_at,
        updated_at=db_node.updated_at
    )

@app.put("/api/nodes/{node_id}", response_model=NodeResponse)
def update_node(node_id: str, node_data: NodeUpdate, db: Session = Depends(get_db)):
    db_node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")

    if node_data.type is not None:
        if node_data.type.lower() != db_node.type.value:
            raise HTTPException(
                status_code=400,
                detail="Cannot change node type after creation."
            )

    if node_data.title is not None:
        db_node.title = node_data.title
    if node_data.description is not None:
        db_node.description = node_data.description
    if node_data.status is not None:
        db_node.status = node_data.status
    if node_data.parent_id is not None:
        if node_data.parent_id == node_id:
            raise HTTPException(status_code=400, detail="A node cannot be its own parent")
        if node_data.parent_id and len(node_data.parent_id.strip()) > 0:
            parent = db.query(models.Node).filter(models.Node.id == node_data.parent_id).first()
            if not parent:
                raise HTTPException(status_code=400, detail="Parent node not found")
            db_node.parent_id = node_data.parent_id
        else:
            db_node.parent_id = None

    db.commit()
    db.refresh(db_node)
    return NodeResponse(
        id=db_node.id,
        title=db_node.title,
        type=db_node.type.value,
        description=db_node.description,
        status=db_node.status,
        parent_id=db_node.parent_id,
        created_at=db_node.created_at,
        updated_at=db_node.updated_at
    )

@app.delete("/api/nodes/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node(node_id: str, db: Session = Depends(get_db)):
    db_node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")
    db.delete(db_node)
    db.commit()
    return None

# Recursive Tree endpoint
@app.get("/api/tree", response_model=List[NodeTreeResponse])
def get_tree(db: Session = Depends(get_db)):
    # Get all nodes
    all_nodes = db.query(models.Node).all()
    
    # Map nodes by id for quick lookup
    node_map = {}
    for node in all_nodes:
        # Create Tree Response object (children will be populated recursively)
        node_map[node.id] = NodeTreeResponse(
            id=node.id,
            title=node.title,
            type=node.type.value,
            description=node.description,
            status=node.status,
            parent_id=node.parent_id,
            created_at=node.created_at,
            updated_at=node.updated_at,
            children=[]
        )
    
    root_nodes = []
    for node in all_nodes:
        tree_node = node_map[node.id]
        if node.parent_id is None:
            root_nodes.append(tree_node)
        else:
            parent_tree_node = node_map.get(node.parent_id)
            if parent_tree_node is not None:
                parent_tree_node.children.append(tree_node)
            else:
                # If parent_id doesn't exist, treat it as a root node to avoid losing data
                root_nodes.append(tree_node)

    return root_nodes

# NOTE: there used to be a POST /api/seed route here that re-ran seed_db.main()
# on demand -- removed 2026-07-17. seed_db.main() deletes every node and
# re-derives them from the markdown files baked into the image; once a
# deployment has real interactively-created content (nodes that only exist
# in the database, not as a markdown file), calling this against it destroys
# that content with no undo. seed_db.py itself is untouched and still used
# by entrypoint.sh for first-boot bootstrap (only runs when the table is
# empty) -- this route was the unsafe, on-demand path, now gone on both the
# frontend (button removed from index.html/app.js) and here.

# Serve static files for Frontend
frontend_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(frontend_dir):
    os.makedirs(frontend_dir)

# We will mount static files at root
# For API requests, they will match the router first. For anything else, serve static.
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")
