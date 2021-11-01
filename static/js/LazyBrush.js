class Point {
  /**
   *
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class LazyPoint extends Point {
  /**
   * Update the x and y values
   *
   * @param {Point} point
   */
  update (point) {
    this.x = point.x
    this.y = point.y
  }

  /**
   * Move the point to another position using an angle and distance
   *
   * @param {number} angle The angle in radians
   * @param {number} distance How much the point should be moved
   */
  moveByAngle (angle, distance) {
    // Rotate the angle based on the browser coordinate system ([0,0] in the top left)
    const angleRotated = angle + (Math.PI / 2)

    this.x = this.x + (Math.sin(angleRotated) * distance),
    this.y = this.y - (Math.cos(angleRotated) * distance)
  }

  /**
   * Check if this point is the same as another point
   *
   * @param {Point} point
   * @returns {boolean}
   */
  equalsTo (point) {
    return this.x === point.x && this.y === point.y
  }

  /**
   * Get the difference for x and y axis to another point
   *
   * @param {Point} point
   * @returns {Point}
   */
  getDifferenceTo (point) {
    return new Point(this.x - point.x, this.y - point.y)
  }

  /**
   * Calculate distance to another point
   *
   * @param {Point} point
   * @returns {Point}
   */
  getDistanceTo (point) {
    const diff = this.getDifferenceTo(point)

    return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2))
  }

  /**
   * Calculate the angle to another point
   *
   * @param {Point} point
   * @returns {Point}
   */
  getAngleTo (point) {
    const diff = this.getDifferenceTo(point)

    return Math.atan2(diff.y, diff.x)
  }

  /**
   * Return a simple object with x and y properties
   *
   * @returns {object}
   */
  toObject () {
    return {
      x: this.x,
      y: this.y
    }
  }
}


const RADIUS_DEFAULT = 30

class LazyBrush {
  /**
   * constructor
   *
   * @param {object} settings
   * @param {number} settings.radius The radius for the lazy area
   * @param {boolean} settings.enabled
   */
  constructor ({ radius = RADIUS_DEFAULT, enabled = true, initialPoint = { x: 0, y: 0 }} = {}) {
    this.radius = radius
    this._isEnabled = enabled

    this.pointer = new LazyPoint(initialPoint.x, initialPoint.y)
    this.brush = new LazyPoint(initialPoint.x, initialPoint.y)

    this.angle = 0
    this.distance = 0
    this._hasMoved = false
  }

  /**
   * Enable lazy brush calculations.
   *
   */
  enable () {
    this._isEnabled = true
  }

  /**
   * Disable lazy brush calculations.
   *
   */
  disable () {
    this._isEnabled = false
  }

  /**
   * @returns {boolean}
   */
  isEnabled () {
    return this._isEnabled
  }

  /**
   * Update the radius
   *
   * @param {number} radius
   */
  setRadius (radius) {
    this.radius = radius
  }

  /**
   * Return the current radius
   *
   * @returns {number}
   */
  getRadius () {
    return this.radius
  }

  /**
   * Return the brush coordinates as a simple object
   *
   * @returns {object}
   */
  getBrushCoordinates () {
    return this.brush.toObject()
  }

  /**
   * Return the pointer coordinates as a simple object
   *
   * @returns {object}
   */
  getPointerCoordinates () {
    return this.pointer.toObject()
  }

  /**
   * Return the brush as a LazyPoint
   *
   * @returns {LazyPoint}
   */
  getBrush () {
    return this.brush
  }

  /**
   * Return the pointer as a LazyPoint
   *
   * @returns {LazyPoint}
   */
  getPointer () {
    return this.pointer
  }

  /**
   * Return the angle between pointer and brush
   *
   * @returns {number} Angle in radians
   */
  getAngle () {
    return this.angle
  }

  /**
   * Return the distance between pointer and brush
   *
   * @returns {number} Distance in pixels
   */
  getDistance () {
    return this.distance
  }

  /**
   * Return if the previous update has moved the brush.
   *
   * @returns {boolean} Whether the brush moved previously.
   */
  brushHasMoved () {
    return this._hasMoved
  }

  /**
   * Updates the pointer point and calculates the new brush point.
   *
   * @param {Point} newPointerPoint
   * @param {Object} options
   * @param {Boolean} options.both Force update pointer and brush
   * @returns {Boolean} Whether any of the two points changed
   */
  update (newPointerPoint, { both = false } = {}) {
    this._hasMoved = false
    if (this.pointer.equalsTo(newPointerPoint) && !both) {
      return false
    }

    this.pointer.update(newPointerPoint)

    if (both) {
      this._hasMoved = true
      this.brush.update(newPointerPoint)
      return true
    }

    if (this._isEnabled) {
      this.distance = this.pointer.getDistanceTo(this.brush)
      this.angle = this.pointer.getAngleTo(this.brush)

      if (this.distance > this.radius) {
        this.brush.moveByAngle(this.angle, this.distance - this.radius)
        this._hasMoved = true
      }
    } else {
      this.distance = 0
      this.angle = 0
      this.brush.update(newPointerPoint)
      this._hasMoved = true
    }

    return true
  }
}


