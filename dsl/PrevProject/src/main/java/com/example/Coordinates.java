package com.example;

public class Coordinates {
    private double x;
    private double y;
    private Double z;

    public Coordinates(double x, double y) {
        this.x = x;
        this.y = y;
        this.z = null;
    }

    public Coordinates(double x, double y, double z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public Double getZ() {
        return z;
    }

    @Override
    public String toString() {
        return "Coordinates{" +
                "x=" + x +
                ", y=" + y +
                (z != null ? ", z=" + z : "") +
                '}';
    }
}
