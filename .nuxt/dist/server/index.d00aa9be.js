import { u as useFetch, P as PageTypes, _ as _sfc_main$1 } from "./server.mjs";
import { defineComponent, mergeProps, unref, useSSRContext } from "vue";
import "vue-router";
import "ufo";
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import "#internal/nitro";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: homepages } = useFetch("/api/home", "$XPRSAmXcm9");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "h-[auto] bg-white" }, _attrs))}><h1> Hello nuxt </h1><!--[-->`);
      ssrRenderList(unref(homepages), (record) => {
        _push(`<div>`);
        if (record.type === unref(PageTypes)._representCategory) {
          _push(ssrRenderComponent(unref(_sfc_main$1), { record }, null, _parent));
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
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export { _sfc_main as default };
