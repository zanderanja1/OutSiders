package com.example;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

public class Building {
    private String name;
    private List<Coordinates> coordinates;

    public Building(String name, List<Coordinates> coordinates) {
        this.name = name;
        this.coordinates = coordinates;
    }

    // Getter methods
    public String getName() {
        return name;
    }

//    public Coordinates getCoordinates() {
//        return coordinates;
//    }

    // Overridden toString method
    @Override
    public String toString() {
        return "Building{" +
                "name='" + name + '\'' +
                ", coordinates=" + coordinates.toString() +
                '}';
    }
    public String toGeoJSON() {
        String coordinatesJSON = this.coordinates.stream()
                .map(coordinate -> String.format(Locale.US, "[%f, %f]", coordinate.getX(), coordinate.getY()))
                .collect(Collectors.joining(", "));
        return String.format(Locale.US, "{\"type\": \"Feature\", \"properties\": {\"name\": \"%s\"}, \"geometry\": {\"type\": \"LineString\", \"coordinates\": [%s]}}", this.name, coordinatesJSON);
    }

}
