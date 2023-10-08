package ru.ifmo.hitcheck.utils;

import java.util.List;
import java.util.Map;
import ru.ifmo.hitcheck.exceptions.InvalidParamsException;

public class HitcheckInput {

    public static final List<Float> valuesX = Utils.range(-3f, 5f, 1f);

    public static final Float minY = -3f;
    public static final Float maxY = 5f;

    public static final List<Float> valuesR = Utils.range(1f, 3f, .5f);

    public Float x;
    public Float y;
    public Float r;

    private HitcheckInput(Float x, Float y, Float r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    public static HitcheckInput fromParamsMap(Map<String, String[]> params)
        throws InvalidParamsException {
        Float minX = valuesX.get(0);
        Float maxX = valuesX.get(valuesX.size() - 1);
        Float x = getClampedFloatFromParams("x", minX, maxX, params);

        Float y = getClampedFloatFromParams("y", minY, maxY, params);

        Float minR = valuesR.get(0);
        Float maxR = valuesR.get(valuesR.size() - 1);
        Float r = getClampedFloatFromParams("r", minR, maxR, params);

        return new HitcheckInput(x, y, r);
    }

    private static Float getClampedFloatFromParams(
        String key,
        Float min,
        Float max,
        Map<String, String[]> params
    ) throws InvalidParamsException {
        String[] values = params.get(key);
        try {
            Float result = Float.parseFloat(values[0]);
            if (result < min || max < result) {
                throw new InvalidParamsException(
                    String.format("'%s' must be between %s and %s", key, min, max)
                );
            }
            return result;
        } catch (
            NumberFormatException | NullPointerException | IndexOutOfBoundsException __
        ) {
            throw new InvalidParamsException(
                String.format("'%s' is required and must be a number", key)
            );
        }
    }

    public boolean hit() {
        if (x < 0 && y < 0) {
            return false;
        }
        if (x < 0 && y >= 0) {
            return x > -r && y < r;
        }
        if (x >= 0 && y >= 0) {
            return x * x + y * y < r * r;
        }
        return y > x - r / 2;
    }
}
