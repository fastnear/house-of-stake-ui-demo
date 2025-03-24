import * as near from "@fastnear/api";

window.near = near;
window.$$ = near.utils.convertUnit;

near.config({
  networkId: "testnet",
});
