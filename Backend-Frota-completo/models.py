from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    cpf = Column(String, unique=True, index=True)
    licensenumber = Column(String, unique=True)
    licensecategory = Column(String)
    licenseexpiry = Column(DateTime)
    status = Column(String, default="active")

    routes = relationship("Route", back_populates="driver")

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    plate = Column(String, unique=True, index=True)
    type = Column(String)
    capacity = Column(Float)
    status = Column(String, default="available")

    routes = relationship("Route", back_populates="vehicle")

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    driverid = Column(Integer, ForeignKey("drivers.id"))
    vehicleid = Column(Integer, ForeignKey("vehicles.id"))
    status = Column(String, default="pending")
    createdat = Column(DateTime(timezone=True), server_default=func.now())
    updatedat = Column(DateTime(timezone=True), onupdate=func.now())
    deliveryaddress = Column(String)
    deliverynumber = Column(String)
    deliverydistrict = Column(String)
    deliverycity = Column(String)
    deliverystate = Column(String)
    deliveryzipcode = Column(String)
    deliverylatitude = Column(Float)
    deliverylongitude = Column(Float)

    driver = relationship("Driver", back_populates="routes")
    vehicle = relationship("Vehicle", back_populates="routes")
    items = relationship("RouteItem", back_populates="route")
    tracking = relationship("GPSTracking", back_populates="route")
    notifications = relationship("WhatsAppNotification", back_populates="route")
    deliveries = relationship("Delivery", back_populates="route")

class RouteItem(Base):
    __tablename__ = "route_items"
    id = Column(Integer, primary_key=True, index=True)
    routeid = Column(Integer, ForeignKey("routes.id"))
    ordernumber = Column(String)
    sequence = Column(Integer)
    status = Column(String, default="pending")

    route = relationship("Route", back_populates="items")

class GPSTracking(Base):
    __tablename__ = "gps_tracking"
    id = Column(Integer, primary_key=True, index=True)
    routeid = Column(Integer, ForeignKey("routes.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    route = relationship("Route", back_populates="tracking")

class WhatsAppNotification(Base):
    __tablename__ = "whatsapp_notifications"
    id = Column(Integer, primary_key=True, index=True)
    routeid = Column(Integer, ForeignKey("routes.id"))
    phone = Column(String)
    message = Column(String)
    status = Column(String, default="sent")

    route = relationship("Route", back_populates="notifications")

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    routeid = Column(Integer, ForeignKey("routes.id"))
    ordernumber = Column(String)
    clientname = Column(String)
    status = Column(String, default="pending")
    deliveredat = Column(DateTime)

    route = relationship("Route", back_populates="deliveries")