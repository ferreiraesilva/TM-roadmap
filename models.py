from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class NodeType(enum.Enum):
    PRODUCT = "product"
    INITIATIVE = "initiative"
    EPIC = "epic"
    STORY = "story"
    BUG = "bug"
    DECISION = "decision"
    RFC = "rfc"
    SPIKE = "spike"

class Node(Base):
    __tablename__ = "nodes"

    id = Column(String(50), primary_key=True)
    title = Column(String(255), nullable=False)
    type = Column(Enum(NodeType), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=True)
    
    parent_id = Column(String(50), ForeignKey("nodes.id"), nullable=True)
    parent = relationship("Node", remote_side=[id], back_populates="children")
    children = relationship("Node", back_populates="parent", cascade="all, delete-orphan")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
