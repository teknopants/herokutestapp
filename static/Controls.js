class Controls {

    constructor() {
        this.KEYSTATE_PRESSED = 1;
        this.KEYSTATE_HELD = 2;
        this.KEYSTATE_RELEASED = -1;
        this.KEYSTATE_NONE = 0;
    }

    // Key Functions
    ProcessKey(keyState) {
        if (keyState == KEYSTATE_PRESSED) {
            keyState = KEYSTATE_HELD; // pressed set to held
        }
        if (keyState == KEYSTATE_RELEASED) {
            keyState = KEYSTATE_NONE; // released set to nothing
        }
        return keyState;
    }
    CheckPressed(keyState) {
        return keyState == KEYSTATE_PRESSED
    }
    CheckHeld(keyState) {
        return keyState == KEYSTATE_PRESSED || keyState == KEYSTATE_HELD
    }
    CheckNone(keyState) {
        return keyState == KEYSTATE_NONE
    }
    CheckReleased(keyState) {
        return keyState == KEYSTATE_RELEASED
    }
}