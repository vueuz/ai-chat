declare module '*.vue' {
  import { DefineComponent, MaybeRefOrGetter, toValue } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;

  export default component;
}
