// Credit to Mathias Bynens for implementing the Vincenty Distance in javascript below

function toRad(n) {
  return n * Math.PI / 180
}

function distVincenty(lat1, lon1, lat2, lon2) {
  var a = 6378137,
    b = 6356752.3142,
    f = 1 / 298.257223563,
    L = toRad(lon2 - lon1),
    U1 = Math.atan((1 - f) * Math.tan(toRad(lat1))),
    U2 = Math.atan((1 - f) * Math.tan(toRad(lat2))),
    sinU1 = Math.sin(U1),
    cosU1 = Math.cos(U1),
    sinU2 = Math.sin(U2),
    cosU2 = Math.cos(U2),
    lambda = L,
    lambdaP,
    iterLimit = 100
  do {
    var sinLambda = Math.sin(lambda),
      cosLambda = Math.cos(lambda),
      sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda))
    if (0 === sinSigma) {
      return 0
    }
    var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda,
      sigma = Math.atan2(sinSigma, cosSigma),
      sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma,
      cosSqAlpha = 1 - sinAlpha * sinAlpha,
      cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha,
      C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha))
    if (isNaN(cos2SigmaM)) {
      cos2SigmaM = 0
    }
    lambdaP = lambda
    lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)))
  } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0)
 
  if (!iterLimit) {
    return NaN
  }
 
  var uSq = cosSqAlpha * (a * a - b * b) / (b * b),
    A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
    B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
    deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM))),
    s = b * A * (sigma - deltaSigma)
  // return s.toFixed(3)
  return (s * 0.000621371).toFixed(1)
}

export default distVincenty