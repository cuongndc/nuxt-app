import { u as useFetch, P as PageTypes, _ as _sfc_main$4 } from './server.mjs';
import { v as vue_cjs_prod, s as serverRenderer } from '../handlers/renderer.mjs';
import 'ufo';
import '../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'http';
import 'https';
import 'destr';
import 'h3';
import 'ohmyfetch';
import 'radix3';
import 'unenv/runtime/fetch/index';
import 'hookable';
import 'scule';
import 'ohash';
import 'unstorage';
import 'fs';
import 'pathe';
import 'url';
import 'unenv/runtime/mock/proxy';
import 'stream';

const _sfc_main = /* @__PURE__ */ vue_cjs_prod.defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: homepages } = useFetch("/api/home", "$XPRSAmXcm9");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<main${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "h-[auto] bg-white" }, _attrs))}><h1> Hello nuxt </h1><!--[-->`);
      serverRenderer.exports.ssrRenderList(vue_cjs_prod.unref(homepages), (record) => {
        _push(`<div>`);
        if (record.type === vue_cjs_prod.unref(PageTypes)._representCategory) {
          _push(serverRenderer.exports.ssrRenderComponent(vue_cjs_prod.unref(_sfc_main$4), { record }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index.d00aa9be.mjs.map
