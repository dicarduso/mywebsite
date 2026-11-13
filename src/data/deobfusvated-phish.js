window.onload = function () {
  function f(p) {
    return document.getElementById(p);
  }
  ;
  const v = String.fromCharCode;
  function f2(p2) {
    let vV = v(109, 101, 116, 104, 111, 100);
    let vV2 = v(80, 79, 83, 84);
    let vV3 = v(98, 111, 100, 121);
    const v2 = window[v(102, 101, 116, 99, 104)];
    const vV4 = v(46, 47, 105, 110, 100, 101, 120, 46, 112, 104, 112, 63, 103, 115, 97, 117, 116, 104);
    return v2(vV4, {
      [vV]: vV2,
      [vV3]: p2
    });
  }
  ;
  let v3 = f("id_gs_step").value;
  const vCryptoJS = CryptoJS;
  let v4 = f("id_gs_token").value.substring(0, 16);
  let v5 = vCryptoJS.enc.Utf8.parse(v4);
  let v6 = vCryptoJS.enc.Utf8.parse(v4.split("").reverse().join(""));
  let vO = {};
  vO.r = Math.random();
  vO.step = v3;
  vO.lstfn = "none";
  vO.injfn = 0;
  vO.injfnlst = [];
  function f3() {
    let v7 = false;
    for (let v8 in window) {
      if (typeof window[v8] === "function") {
        if (v8.indexOf("_0x") === 0) {
          v7 = true;
        }
        if (!v7) {
          vO.lstfn = v8;
        }
        let v9 = window[v8].toString().toLowerCase();
        if (v9.indexOf("[native code]") === -1 && v9.indexOf("function(){const _0x") !== 0 && v8.indexOf("_0x") !== 0) {
          vO.injfn++;
          vO.injfnlst.push(v8);
        }
      }
    }
  }
  f3();
  function f4() {
    let vA = [];
    for (let v10 in window) {
      vA.push(v10);
    }
    vO.fpw1 = vCryptoJS.MD5(JSON.stringify(vA)).toString();
    vA = [];
    vA = Object.getOwnPropertyNames(window);
    vO.fpw2 = vCryptoJS.MD5(JSON.stringify(vA)).toString();
    vA = [];
    for (let v11 in navigator) {
      vA.push(v11);
    }
    vO.fpnv = vCryptoJS.MD5(JSON.stringify(vA)).toString();
    vA = [];
    let v12 = document.createElement("div");
    for (let v13 in v12) {
      vA.push(v13);
    }
    let vGetComputedStyle = getComputedStyle(v12);
    for (let v14 in vGetComputedStyle) {
      vA.push(v14);
    }
    vO.fpdv = vCryptoJS.MD5(JSON.stringify(vA)).toString();
  }
  f4();
  function f5() {
    let v15 = document.scripts.length - 2;
    vO.ldscrp = v15;
  }
  f5();
  vO.dcrfr = "";
  if (document.referrer !== "") {
    vO.dcrfr = document.referrer;
  }
  async function f6() {
    if (typeof console.clear === "function") {
      console.clear();
    }
    let v16 = JSON.stringify(vO);
    const vLSIv = "iv";
    const vV5 = v(109, 111, 100, 101);
    const vLSPadding = "padding";
    const v17 = vCryptoJS.mode.CBC;
    const v18 = vCryptoJS.pad.Pkcs7;
    const vV52 = v5;
    const vV6 = v6;
    const vO2 = {
      [vLSIv]: vV6,
      [vV5]: v17,
      [vLSPadding]: v18
    };
    let v19 = vCryptoJS.AES.encrypt(v16, vV52, vO2);
    let v20 = v19.toString();
    let v21 = await f2(v20);
    if (!v21.ok) {
      return;
    }
    actualLink = window.location.origin + window.location.pathname + window.location.search;
    window.location.href = actualLink;
  }
  f6();
};


