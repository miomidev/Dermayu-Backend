import L from "leaflet";

// Patch pengaman Leaflet: Mencegah error "Cannot read properties of undefined (reading '_leaflet_pos')"
// saat map di-unmount, berpindah halaman SPA, atau di-resize di tengah animasi flyTo
if (typeof window !== "undefined" && L) {
  if (L.DomUtil) {
    if (L.DomUtil.getPosition) {
      const _origGetPos = L.DomUtil.getPosition;
      L.DomUtil.getPosition = function (el: any) {
        if (!el) return new L.Point(0, 0);
        try {
          return _origGetPos.call(L.DomUtil, el) || new L.Point(0, 0);
        } catch {
          return new L.Point(0, 0);
        }
      };
    }
    if (L.DomUtil.setPosition) {
      const _origSetPos = L.DomUtil.setPosition;
      L.DomUtil.setPosition = function (el: any, point: any) {
        if (!el) return;
        try {
          return _origSetPos.call(L.DomUtil, el, point);
        } catch {}
      };
    }
  }

  if (L.PosAnimation && L.PosAnimation.prototype) {
    const _origPosRun = L.PosAnimation.prototype.run;
    if (_origPosRun) {
      L.PosAnimation.prototype.run = function (
        el: any,
        newPos: any,
        duration: any,
        easeLinearity: any
      ) {
        if (!el) return;
        try {
          return _origPosRun.call(this, el, newPos, duration, easeLinearity);
        } catch {
          (this as any)._inProgress = false;
        }
      };
    }
    const _origPosStop = L.PosAnimation.prototype.stop;
    if (_origPosStop) {
      L.PosAnimation.prototype.stop = function () {
        try {
          return _origPosStop.call(this);
        } catch {
          (this as any)._inProgress = false;
        }
      };
    }
  }

  if (L.Map && L.Map.prototype) {
    const _origGetMapPanePos = (L.Map.prototype as any)._getMapPanePos;
    if (_origGetMapPanePos) {
      (L.Map.prototype as any)._getMapPanePos = function () {
        if (!this._mapPane) return new L.Point(0, 0);
        try {
          return _origGetMapPanePos.call(this) || new L.Point(0, 0);
        } catch {
          return new L.Point(0, 0);
        }
      };
    }
  }
}

export {};

