export interface IPluginConnectorPayload {
  input: any
  plugins: Array<(input: any)=> Promise<void>>
}

export class PluginConnector {
  static async connect({ input, plugins }: IPluginConnectorPayload){
    if(!plugins || plugins.length === 0 || !input) return
    for(const plugin of plugins){  
      await plugin(input)
    }
  }
}