declare class ICommand {
  constructor(props:{pattern:string, docs:string});
  before(ctx: any):Promise<any>;
  after(ctx: any):Promise<any>;
  main(ctx: any):Promise<any>;
  execute(ctx: any):Promise<any>;
  argument(name: string, opts?:{ type?:string, description?:string }):any;
  parameter(name: string, opts?:any):any;
  flag(name: string, opts:any):any;
  help(): void;
}

export = ICommand;
