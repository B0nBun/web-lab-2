package ru.ifmo.hitcheck.utils;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import java.time.Instant;

public record HitcheckResult(Float x, Float y, Float r, boolean hit, Instant timestamp) {
    public static HitcheckResult fromInput(HitcheckInput input) {
        return new HitcheckResult(input.x, input.y, input.r, input.hit(), Instant.now());
    }

    public JsonObject toJson() {
        return Json
            .createObjectBuilder()
            .add("x", this.x())
            .add("y", this.y())
            .add("r", this.r())
            .add("hit", this.hit())
            .add("timestamp", this.timestamp().getEpochSecond())
            .build();
    }
}
