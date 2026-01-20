
from typing import TypeVar, Generic, Optional, List, Type, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from pydantic import BaseModel
import logging

from app.database import Base

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_by_field(
        self, 
        db: Session, 
        field: str, 
        value: Any
    ) -> Optional[ModelType]:
        return db.query(self.model).filter(
            getattr(self.model, field) == value
        ).first()
    
    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()
    
    def get_all(self, db: Session) -> List[ModelType]:
        return db.query(self.model).all()
    
    def count(self, db: Session) -> int:
        return db.query(self.model).count()
    
    def exists(self, db: Session, id: Any) -> bool:
        return db.query(self.model).filter(self.model.id == id).count() > 0

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_data = obj_in.dict() if hasattr(obj_in, 'dict') else obj_in.model_dump()
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        logger.debug(f"Created {self.model.__name__} with id={db_obj.id}")
        return db_obj
    
    def create_from_dict(self, db: Session, *, data: dict) -> ModelType:
        db_obj = self.model(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def bulk_create(
        self, 
        db: Session, 
        *, 
        objects: List[CreateSchemaType]
    ) -> List[ModelType]:
        db_objects = []
        for obj_in in objects:
            obj_data = obj_in.dict() if hasattr(obj_in, 'dict') else obj_in.model_dump()
            db_obj = self.model(**obj_data)
            db.add(db_obj)
            db_objects.append(db_obj)
        db.commit()
        for obj in db_objects:
            db.refresh(obj)
        return db_objects

    def update(
        self, 
        db: Session, 
        *, 
        db_obj: ModelType, 
        obj_in: UpdateSchemaType
    ) -> ModelType:
        update_data = obj_in.dict(exclude_unset=True) if hasattr(obj_in, 'dict') else obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        logger.debug(f"Updated {self.model.__name__} id={db_obj.id}")
        return db_obj
    
    def update_from_dict(
        self, 
        db: Session, 
        *, 
        db_obj: ModelType, 
        data: dict
    ) -> ModelType:
        for field, value in data.items():
            if hasattr(db_obj, field) and value is not None:
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_by_id(
        self, 
        db: Session, 
        *, 
        id: Any, 
        data: dict
    ) -> Optional[ModelType]:
        db_obj = self.get(db, id)
        if db_obj:
            return self.update_from_dict(db, db_obj=db_obj, data=data)
        return None

    def delete(self, db: Session, *, id: Any) -> Optional[ModelType]:
        obj = db.query(self.model).get(id)
        if obj:
            db.delete(obj)
            db.commit()
            logger.debug(f"Deleted {self.model.__name__} id={id}")
        return obj
    
    def soft_delete(self, db: Session, *, id: Any) -> Optional[ModelType]:
        obj = self.get(db, id)
        if obj and hasattr(obj, 'is_deleted'):
            obj.is_deleted = True
            db.commit()
            db.refresh(obj)
            return obj
        return None

    def filter_by(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100, 
        **filters
    ) -> List[ModelType]:
        query = db.query(self.model)
        
        for field, value in filters.items():
            if hasattr(self.model, field) and value is not None:
                query = query.filter(getattr(self.model, field) == value)
        
        return query.offset(skip).limit(limit).all()
    
    def search(
        self, 
        db: Session, 
        *, 
        field: str, 
        query: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[ModelType]:
        if not hasattr(self.model, field):
            return []
        
        return db.query(self.model).filter(
            getattr(self.model, field).ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()
    
    def order_by(
        self, 
        db: Session, 
        *, 
        field: str, 
        desc: bool = False, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[ModelType]:
        if not hasattr(self.model, field):
            return self.get_multi(db, skip=skip, limit=limit)
        
        order_field = getattr(self.model, field)
        if desc:
            order_field = order_field.desc()
        
        return db.query(self.model).order_by(order_field).offset(skip).limit(limit).all()
