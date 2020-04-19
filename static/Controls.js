class Controls {

    constructor() {
        this.KEYSTATES = { PRESSED: 1, HELD: 2, RELEASED: -1, NONE: 0 };
        this.click = this.KEYSTATES.NONE;
    }

    Update() {
        this.ProcessKey(this.click);
    }

    // Key Functions
    ProcessKey(keyState) {
        if (keyState == this.KEYSTATES.PRESSED) {
            keyState = this.KEYSTATES.HELD; // pressed set to held
        }
        if (keyState == this.KEYSTATES.RELEASED) {
            keyState = this.KEYSTATES.NONE; // released set to nothing
        }
        return keyState;
    }
    CheckPressed(keyState) {
        return keyState == this.KEYSTATES.PRESSED
    }
    CheckHeld(keyState) {
        return keyState == this.KEYSTATES.PRESSED || this.keyState == KEYSTATES.HELD
    }
    CheckNone(keyState) {
        return keyState == this.KEYSTATES.NONE
    }
    CheckReleased(keyState) {
        return keyState == this.KEYSTATES.RELEASED
    }
}
export default Controls;