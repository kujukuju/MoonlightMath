class Mat3 extends Array {
    static _tempMat = null;
    static _tempVec = new Vec2();

    // NOTE: libgdx's indices are transposed

    constructor() {
        super(9);

        this[0] = 1;
        this[1] = 0;
        this[2] = 0;
        this[3] = 0;
        this[4] = 1;
        this[5] = 0;
        this[6] = 0;
        this[7] = 0;
        this[8] = 1;
    }

    copy(mat) {
        this[0] = mat[0];
        this[1] = mat[1];
        this[2] = mat[2];
        this[3] = mat[3];
        this[4] = mat[4];
        this[5] = mat[5];
        this[6] = mat[6];
        this[7] = mat[7];
        this[8] = mat[8];

        return this;
    }

    determinant() {
        return this[0] * this[4] * this[8] + this[1] * this[5] * this[6] + this[2] * this[3] * this[7] - this[0]
            * this[5] * this[7] - this[1] * this[3] * this[8] - this[2] * this[4] * this[6];
    }

    invert() {
        const det = this.determinant();
        if (det === 0) {
            return null;
        }

        const inv = 1.0 / det;

        Mat3._tempMat[0] = this[4] * this[8] - this[7] * this[5];
        Mat3._tempMat[3] = this[6] * this[5] - this[3] * this[8];
        Mat3._tempMat[6] = this[3] * this[7] - this[6] * this[4];
        Mat3._tempMat[1] = this[7] * this[2] - this[1] * this[8];
        Mat3._tempMat[4] = this[0] * this[8] - this[6] * this[2];
        Mat3._tempMat[7] = this[6] * this[1] - this[0] * this[7];
        Mat3._tempMat[2] = this[1] * this[5] - this[4] * this[2];
        Mat3._tempMat[5] = this[3] * this[2] - this[0] * this[5];
        Mat3._tempMat[8] = this[0] * this[4] - this[3] * this[1];

        this[0] = inv * Mat3._tempMat[0];
        this[3] = inv * Mat3._tempMat[3];
        this[6] = inv * Mat3._tempMat[6];
        this[1] = inv * Mat3._tempMat[1];
        this[4] = inv * Mat3._tempMat[4];
        this[7] = inv * Mat3._tempMat[7];
        this[2] = inv * Mat3._tempMat[2];
        this[5] = inv * Mat3._tempMat[5];
        this[8] = inv * Mat3._tempMat[8];

        return this;
    }

    multiply(mat) {
        const v00 = this[0] * mat[0] + this[3] * mat[1] + this[6] * mat[2];
        const v01 = this[0] * mat[3] + this[3] * mat[4] + this[6] * mat[5];
        const v02 = this[0] * mat[6] + this[3] * mat[7] + this[6] * mat[8];

        const v10 = this[1] * mat[0] + this[4] * mat[1] + this[7] * mat[2];
        const v11 = this[1] * mat[3] + this[4] * mat[4] + this[7] * mat[5];
        const v12 = this[1] * mat[6] + this[4] * mat[7] + this[7] * mat[8];

        const v20 = this[2] * mat[0] + this[5] * mat[1] + this[8] * mat[2];
        const v21 = this[2] * mat[3] + this[5] * mat[4] + this[8] * mat[5];
        const v22 = this[2] * mat[6] + this[5] * mat[7] + this[8] * mat[8];

        this[0] = v00;
        this[1] = v10;
        this[2] = v20;
        this[3] = v01;
        this[4] = v11;
        this[5] = v21;
        this[6] = v02;
        this[7] = v12;
        this[8] = v22;

        return this;
    }

    leftMultiply(mat) {
        const v00 = mat[0] * this[0] + mat[3] * this[1] + mat[6] * this[2];
        const v01 = mat[0] * this[3] + mat[3] * this[4] + mat[6] * this[5];
        const v02 = mat[0] * this[6] + mat[3] * this[7] + mat[6] * this[8];

        const v10 = mat[1] * this[0] + mat[4] * this[1] + mat[7] * this[2];
        const v11 = mat[1] * this[3] + mat[4] * this[4] + mat[7] * this[5];
        const v12 = mat[1] * this[6] + mat[4] * this[7] + mat[7] * this[8];

        const v20 = mat[2] * this[0] + mat[5] * this[1] + mat[8] * this[2];
        const v21 = mat[2] * this[3] + mat[5] * this[4] + mat[8] * this[5];
        const v22 = mat[2] * this[6] + mat[5] * this[7] + mat[8] * this[8];

        this[0] = v00;
        this[1] = v10;
        this[2] = v20;
        this[3] = v01;
        this[4] = v11;
        this[5] = v21;
        this[6] = v02;
        this[7] = v12;
        this[8] = v22;

        return this;
    }

    setToTranslation(vec) {
        this[0] = 1;
        this[1] = 0;
        this[2] = 0;
        this[3] = 0;
        this[4] = 1;
        this[5] = 0;
        this[6] = vec[0];
        this[7] = vec[1];
        this[8] = 1;

        return this;
    }

    getTranslation(out) {
        out[0] = this[6];
        out[1] = this[7];

        return out;
    }

    setTranslation(vec) {
        const inverseVec = this.getTranslation(Mat3._tempVec).negate();
        const inverse = Mat3._tempMat.setToTranslation(inverseVec);

        // translation * (inverse * self)
        this.leftMultiply(inverse);

        const correct = Mat3._tempMat.setToTranslation(vec);
        return this.leftMultiply(correct)
    }

    translate(vec) {
        Mat3._tempMat.setToTranslation(vec);

        return this.multiply(Mat3._tempMat);
    }

    setToRotation(radians) {
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        this[0] = cos;
        this[1] = sin;
        this[2] = 0;

        this[3] = -sin;
        this[4] = cos;
        this[5] = 0;

        this[6] = 0;
        this[7] = 0;
        this[8] = 1;

        return this;
    }

    getRotation() {
        return Math.atan2(this[1], this[0]);
    }

    setRotation(radians) {
        const inverse = Mat3._tempMat.setToRotation(-this.getRotation());
        this.multiply(inverse);
        const correct = Mat3._tempMat.setToRotation(radians);
        return this.multiply(correct);
    }

    rotate(radians) {
        Mat3._tempMat.setToRotation(radians);

        return this.multiply(Mat3._tempMat);
    }
}

Mat3._tempMat = new Mat3();