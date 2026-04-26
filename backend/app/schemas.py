from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TagNode(BaseModel):
    name: str = Field(min_length=1)
    data: Optional[str] = None
    children: Optional[List["TagNode"]] = None

    @model_validator(mode="after")
    def validate_node_shape(self):
        has_data = self.data is not None
        has_children = self.children is not None

        if has_data == has_children:
            raise ValueError("Each tag must have either 'data' or 'children', but not both.")
        return self


TagNode.model_rebuild()


class TreeCreate(BaseModel):
    tree: TagNode


class TreeUpdate(BaseModel):
    tree: TagNode


class TreeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tree: TagNode
    created_at: datetime
    updated_at: datetime
