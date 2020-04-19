class Help {

    Loop(val, min, max) {
        if (val < min) {
            val = max;
        }
        if (val > max) {
            val = min;
        }
        return val;
    }

    Approach(val, goal, step) {
        if (val < goal) {
            val += step;
            val = Math.min(goal, val);
        }
        else {
            val -= step;
            val = Math.max(goal, val);
        }
        return val;
    }
}