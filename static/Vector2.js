class Vector2 {

    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;
    }

    AngleToVector(angle) {
        angle = DegreesToRadians(angle);
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
    }

    DegreesToRadians(degrees) {
        return degrees *= (Math.PI / 180);
    }

    VectorMagnitude(vector2) {
        var _x = vector2.x;
        var _y = vector2.y;
        return Math.sqrt(_x * _x + _y * _y);
    }

    VectorNormalized(vector2) {
        var _magnitude = VectorMagnitude(vector2);
        var _x = vector2.x / _magnitude;
        var _y = vector2.y / _magnitude;
        return {
            x: _x,
            y: _y
        }
    }

    // Motion
    AddMotion(speedVector, speed, direction, maxSpeed) {
        var vector2 = AngleToVector(direction);
        speedVector.x += vector2.x * speed;
        speedVector.y += vector2.y * speed;
        var _speedVectorMagnitude = VectorMagnitude(speedVector);

        if (_speedVectorMagnitude > maxSpeed) {
            speedVector = VectorNormalized(vector2);
            speedVector.x *= maxSpeed;
            speedVector.y *= maxSpeed;
        }

        return speedVector;
    }
    AddMotionVector(speedVector, speed, vectorDirection, maxSpeed) {
        speedVector.x += vectorDirection.x * speed;
        speedVector.y += vectorDirection.y * speed;
        var _speedVectorMagnitude = VectorMagnitude(speedVector);

        if (_speedVectorMagnitude > maxSpeed) {
            speedVector = VectorNormalized(speedVector);
            speedVector.x *= maxSpeed;
            speedVector.y *= maxSpeed;
        }

        return speedVector;
    }

    Friction(vector2, friction) {
        vector2.x /= friction;
        vector2.y /= friction;
        return vector2;
    }
}