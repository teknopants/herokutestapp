export class Controls {

    constructor() {
        const KEYSTATES = { PRESSED: 1, HELD: 2, RELEASED: -1, NONE: 0 };
    }

    // Key Functions
    ProcessKey(keyState) {
        if (keyState == KEYSTATES.PRESSED) {
            keyState = KEYSTATES.HELD; // pressed set to held
        }
        if (keyState == KEYSTATES.RELEASED) {
            keyState = KEYSTATES.NONE; // released set to nothing
        }
        return keyState;
    }
    CheckPressed(keyState) {
        return keyState == KEYSTATES.PRESSED
    }
    CheckHeld(keyState) {
        return keyState == KEYSTATES.PRESSED || keyState == KEYSTATES.HELD
    }
    CheckNone(keyState) {
        return keyState == KEYSTATES.NONE
    }
    CheckReleased(keyState) {
        return keyState == KEYSTATES.RELEASED
    }
}