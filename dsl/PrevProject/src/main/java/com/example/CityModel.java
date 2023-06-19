//package com.example;
//
//import org.locationtech.jts.geom.Geometry;
//import org.locationtech.jts.geom.Coordinate;
//import org.geojson.Point;
//import org.geojson.Feature;
//import org.locationtech.jts.geom.GeometryFactory;
//
//abstract class CityElement {
//    private String id;
//
//    public CityElement(String id) {
//        this.id = id;
//    }
//
//    public String getId() {
//        return id;
//    }
//
//    public abstract Feature toGeoJSON();
//}
//
//class City extends CityElement {
//    public City(String id) {
//        super(id);
//    }
//
//    @Override
//    public Feature toGeoJSON() {
//        org.locationtech.jts.geom.Point point = new GeometryFactory().createPoint(new Coordinate(0.5, 0.5));
//        Feature feature = new Feature();
//        feature.setGeometry(new Point(point.getX(), point.getY()));
//        feature.setProperty("id", this.getId());
//        return feature;
//    }
//    // ... rest of your code ...
//}
//
//class District extends CityElement {
//    public District(String id) {
//        super(id);
//    }
//
//    @Override
//    public Feature toGeoJSON() {
//        org.locationtech.jts.geom.Point point = new GeometryFactory().createPoint(new Coordinate(0.5, 0.5));
//        Feature feature = new Feature();
//        feature.setGeometry(new Point(point.getX(), point.getY()));
//        feature.setProperty("id", this.getId());
//        return feature;
//    }
//    // ... rest of your code ...
//}
//
//class Zone extends CityElement {
//    public Zone(String id) {
//        super(id);
//    }
//
//    @Override
//    public Feature toGeoJSON() {
//        org.locationtech.jts.geom.Point point = new GeometryFactory().createPoint(new Coordinate(0.5, 0.5));
//        Feature feature = new Feature();
//        feature.setGeometry(new Point(point.getX(), point.getY()));
//        feature.setProperty("id", this.getId());
//        return feature;
//    }
//    // ... rest of your code ...
//}
//
//class Street extends CityElement {
//    public Street(String id) {
//        super(id);
//    }
//
//    @Override
//    public Feature toGeoJSON() {
//        org.locationtech.jts.geom.Point point = new GeometryFactory().createPoint(new Coordinate(0.5, 0.5));
//        Feature feature = new Feature();
//        feature.setGeometry(new Point(point.getX(), point.getY()));
//        feature.setProperty("id", this.getId());
//        return feature;
//    }
//    // ... rest of your code ...
//}
//
//
//
//
//class Building extends CityElement {
//    public Building(String id) {
//        super(id);
//    }
//
//    @Override
//    public Feature toGeoJSON() {
//        org.locationtech.jts.geom.Point point = new GeometryFactory().createPoint(new Coordinate(0.5, 0.5));
//        Feature feature = new Feature();
//        feature.setGeometry(new Point(point.getX(), point.getY()));
//        feature.setProperty("id", this.getId());
//        return feature;
//    }
//    // ... rest of your code ...
//}
//
// class Main {
//    public static void main(String[] args) {
//        City city = new City("1");
//        District district = new District("2");
//        Zone zone = new Zone("3");
//        Street street = new Street("4");
//        Building building = new Building("5");
//
//        System.out.println("City GeoJSON: " + city.toGeoJSON());
//        System.out.println("District GeoJSON: " + district.toGeoJSON());
//        System.out.println("Zone GeoJSON: " + zone.toGeoJSON());
//        System.out.println("Street GeoJSON: " + street.toGeoJSON());
//        System.out.println("Building GeoJSON: " + building.toGeoJSON());
//    }
//}
