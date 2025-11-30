
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Reel
 * 
 */
export type Reel = $Result.DefaultSelection<Prisma.$ReelPayload>
/**
 * Model Lifestory
 * 
 */
export type Lifestory = $Result.DefaultSelection<Prisma.$LifestoryPayload>
/**
 * Model WheelTexture
 * 
 */
export type WheelTexture = $Result.DefaultSelection<Prisma.$WheelTexturePayload>
/**
 * Model Memory
 * 
 */
export type Memory = $Result.DefaultSelection<Prisma.$MemoryPayload>
/**
 * Model Relationship
 * 
 */
export type Relationship = $Result.DefaultSelection<Prisma.$RelationshipPayload>
/**
 * Model Record
 * 
 */
export type Record = $Result.DefaultSelection<Prisma.$RecordPayload>
/**
 * Model RecordItem
 * 
 */
export type RecordItem = $Result.DefaultSelection<Prisma.$RecordItemPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.reel`: Exposes CRUD operations for the **Reel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Reels
    * const reels = await prisma.reel.findMany()
    * ```
    */
  get reel(): Prisma.ReelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lifestory`: Exposes CRUD operations for the **Lifestory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Lifestories
    * const lifestories = await prisma.lifestory.findMany()
    * ```
    */
  get lifestory(): Prisma.LifestoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.wheelTexture`: Exposes CRUD operations for the **WheelTexture** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WheelTextures
    * const wheelTextures = await prisma.wheelTexture.findMany()
    * ```
    */
  get wheelTexture(): Prisma.WheelTextureDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memory`: Exposes CRUD operations for the **Memory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Memories
    * const memories = await prisma.memory.findMany()
    * ```
    */
  get memory(): Prisma.MemoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.relationship`: Exposes CRUD operations for the **Relationship** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Relationships
    * const relationships = await prisma.relationship.findMany()
    * ```
    */
  get relationship(): Prisma.RelationshipDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.record`: Exposes CRUD operations for the **Record** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Records
    * const records = await prisma.record.findMany()
    * ```
    */
  get record(): Prisma.RecordDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recordItem`: Exposes CRUD operations for the **RecordItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RecordItems
    * const recordItems = await prisma.recordItem.findMany()
    * ```
    */
  get recordItem(): Prisma.RecordItemDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.17.1
   * Query Engine version: 272a37d34178c2894197e17273bf937f25acdeac
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Reel: 'Reel',
    Lifestory: 'Lifestory',
    WheelTexture: 'WheelTexture',
    Memory: 'Memory',
    Relationship: 'Relationship',
    Record: 'Record',
    RecordItem: 'RecordItem'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "reel" | "lifestory" | "wheelTexture" | "memory" | "relationship" | "record" | "recordItem"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Reel: {
        payload: Prisma.$ReelPayload<ExtArgs>
        fields: Prisma.ReelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload>
          }
          findFirst: {
            args: Prisma.ReelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload>
          }
          findMany: {
            args: Prisma.ReelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload>[]
          }
          create: {
            args: Prisma.ReelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload>
          }
          createMany: {
            args: Prisma.ReelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload>[]
          }
          delete: {
            args: Prisma.ReelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload>
          }
          update: {
            args: Prisma.ReelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload>
          }
          deleteMany: {
            args: Prisma.ReelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload>[]
          }
          upsert: {
            args: Prisma.ReelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReelPayload>
          }
          aggregate: {
            args: Prisma.ReelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReel>
          }
          groupBy: {
            args: Prisma.ReelGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReelGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReelCountArgs<ExtArgs>
            result: $Utils.Optional<ReelCountAggregateOutputType> | number
          }
        }
      }
      Lifestory: {
        payload: Prisma.$LifestoryPayload<ExtArgs>
        fields: Prisma.LifestoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LifestoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LifestoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload>
          }
          findFirst: {
            args: Prisma.LifestoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LifestoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload>
          }
          findMany: {
            args: Prisma.LifestoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload>[]
          }
          create: {
            args: Prisma.LifestoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload>
          }
          createMany: {
            args: Prisma.LifestoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LifestoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload>[]
          }
          delete: {
            args: Prisma.LifestoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload>
          }
          update: {
            args: Prisma.LifestoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload>
          }
          deleteMany: {
            args: Prisma.LifestoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LifestoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LifestoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload>[]
          }
          upsert: {
            args: Prisma.LifestoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LifestoryPayload>
          }
          aggregate: {
            args: Prisma.LifestoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLifestory>
          }
          groupBy: {
            args: Prisma.LifestoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<LifestoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.LifestoryCountArgs<ExtArgs>
            result: $Utils.Optional<LifestoryCountAggregateOutputType> | number
          }
        }
      }
      WheelTexture: {
        payload: Prisma.$WheelTexturePayload<ExtArgs>
        fields: Prisma.WheelTextureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WheelTextureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WheelTextureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload>
          }
          findFirst: {
            args: Prisma.WheelTextureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WheelTextureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload>
          }
          findMany: {
            args: Prisma.WheelTextureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload>[]
          }
          create: {
            args: Prisma.WheelTextureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload>
          }
          createMany: {
            args: Prisma.WheelTextureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WheelTextureCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload>[]
          }
          delete: {
            args: Prisma.WheelTextureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload>
          }
          update: {
            args: Prisma.WheelTextureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload>
          }
          deleteMany: {
            args: Prisma.WheelTextureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WheelTextureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WheelTextureUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload>[]
          }
          upsert: {
            args: Prisma.WheelTextureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WheelTexturePayload>
          }
          aggregate: {
            args: Prisma.WheelTextureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWheelTexture>
          }
          groupBy: {
            args: Prisma.WheelTextureGroupByArgs<ExtArgs>
            result: $Utils.Optional<WheelTextureGroupByOutputType>[]
          }
          count: {
            args: Prisma.WheelTextureCountArgs<ExtArgs>
            result: $Utils.Optional<WheelTextureCountAggregateOutputType> | number
          }
        }
      }
      Memory: {
        payload: Prisma.$MemoryPayload<ExtArgs>
        fields: Prisma.MemoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          findFirst: {
            args: Prisma.MemoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          findMany: {
            args: Prisma.MemoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>[]
          }
          create: {
            args: Prisma.MemoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          createMany: {
            args: Prisma.MemoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>[]
          }
          delete: {
            args: Prisma.MemoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          update: {
            args: Prisma.MemoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          deleteMany: {
            args: Prisma.MemoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>[]
          }
          upsert: {
            args: Prisma.MemoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryPayload>
          }
          aggregate: {
            args: Prisma.MemoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemory>
          }
          groupBy: {
            args: Prisma.MemoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryCountAggregateOutputType> | number
          }
        }
      }
      Relationship: {
        payload: Prisma.$RelationshipPayload<ExtArgs>
        fields: Prisma.RelationshipFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RelationshipFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RelationshipFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload>
          }
          findFirst: {
            args: Prisma.RelationshipFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RelationshipFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload>
          }
          findMany: {
            args: Prisma.RelationshipFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload>[]
          }
          create: {
            args: Prisma.RelationshipCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload>
          }
          createMany: {
            args: Prisma.RelationshipCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RelationshipCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload>[]
          }
          delete: {
            args: Prisma.RelationshipDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload>
          }
          update: {
            args: Prisma.RelationshipUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload>
          }
          deleteMany: {
            args: Prisma.RelationshipDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RelationshipUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RelationshipUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload>[]
          }
          upsert: {
            args: Prisma.RelationshipUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RelationshipPayload>
          }
          aggregate: {
            args: Prisma.RelationshipAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRelationship>
          }
          groupBy: {
            args: Prisma.RelationshipGroupByArgs<ExtArgs>
            result: $Utils.Optional<RelationshipGroupByOutputType>[]
          }
          count: {
            args: Prisma.RelationshipCountArgs<ExtArgs>
            result: $Utils.Optional<RelationshipCountAggregateOutputType> | number
          }
        }
      }
      Record: {
        payload: Prisma.$RecordPayload<ExtArgs>
        fields: Prisma.RecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          findFirst: {
            args: Prisma.RecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          findMany: {
            args: Prisma.RecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>[]
          }
          create: {
            args: Prisma.RecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          createMany: {
            args: Prisma.RecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>[]
          }
          delete: {
            args: Prisma.RecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          update: {
            args: Prisma.RecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          deleteMany: {
            args: Prisma.RecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecordUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>[]
          }
          upsert: {
            args: Prisma.RecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordPayload>
          }
          aggregate: {
            args: Prisma.RecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecord>
          }
          groupBy: {
            args: Prisma.RecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecordCountArgs<ExtArgs>
            result: $Utils.Optional<RecordCountAggregateOutputType> | number
          }
        }
      }
      RecordItem: {
        payload: Prisma.$RecordItemPayload<ExtArgs>
        fields: Prisma.RecordItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecordItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecordItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload>
          }
          findFirst: {
            args: Prisma.RecordItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecordItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload>
          }
          findMany: {
            args: Prisma.RecordItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload>[]
          }
          create: {
            args: Prisma.RecordItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload>
          }
          createMany: {
            args: Prisma.RecordItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecordItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload>[]
          }
          delete: {
            args: Prisma.RecordItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload>
          }
          update: {
            args: Prisma.RecordItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload>
          }
          deleteMany: {
            args: Prisma.RecordItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecordItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecordItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload>[]
          }
          upsert: {
            args: Prisma.RecordItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecordItemPayload>
          }
          aggregate: {
            args: Prisma.RecordItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecordItem>
          }
          groupBy: {
            args: Prisma.RecordItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecordItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecordItemCountArgs<ExtArgs>
            result: $Utils.Optional<RecordItemCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    reel?: ReelOmit
    lifestory?: LifestoryOmit
    wheelTexture?: WheelTextureOmit
    memory?: MemoryOmit
    relationship?: RelationshipOmit
    record?: RecordOmit
    recordItem?: RecordItemOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    records: number
    reels: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | UserCountOutputTypeCountRecordsArgs
    reels?: boolean | UserCountOutputTypeCountReelsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecordWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReelWhereInput
  }


  /**
   * Count Type ReelCountOutputType
   */

  export type ReelCountOutputType = {
    memorys: number
    relationships: number
    childhood: number
  }

  export type ReelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memorys?: boolean | ReelCountOutputTypeCountMemorysArgs
    relationships?: boolean | ReelCountOutputTypeCountRelationshipsArgs
    childhood?: boolean | ReelCountOutputTypeCountChildhoodArgs
  }

  // Custom InputTypes
  /**
   * ReelCountOutputType without action
   */
  export type ReelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReelCountOutputType
     */
    select?: ReelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReelCountOutputType without action
   */
  export type ReelCountOutputTypeCountMemorysArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryWhereInput
  }

  /**
   * ReelCountOutputType without action
   */
  export type ReelCountOutputTypeCountRelationshipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RelationshipWhereInput
  }

  /**
   * ReelCountOutputType without action
   */
  export type ReelCountOutputTypeCountChildhoodArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WheelTextureWhereInput
  }


  /**
   * Count Type MemoryCountOutputType
   */

  export type MemoryCountOutputType = {
    wheelTextures: number
  }

  export type MemoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wheelTextures?: boolean | MemoryCountOutputTypeCountWheelTexturesArgs
  }

  // Custom InputTypes
  /**
   * MemoryCountOutputType without action
   */
  export type MemoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryCountOutputType
     */
    select?: MemoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MemoryCountOutputType without action
   */
  export type MemoryCountOutputTypeCountWheelTexturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WheelTextureWhereInput
  }


  /**
   * Count Type RelationshipCountOutputType
   */

  export type RelationshipCountOutputType = {
    wheelTextures: number
  }

  export type RelationshipCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wheelTextures?: boolean | RelationshipCountOutputTypeCountWheelTexturesArgs
  }

  // Custom InputTypes
  /**
   * RelationshipCountOutputType without action
   */
  export type RelationshipCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RelationshipCountOutputType
     */
    select?: RelationshipCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RelationshipCountOutputType without action
   */
  export type RelationshipCountOutputTypeCountWheelTexturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WheelTextureWhereInput
  }


  /**
   * Count Type RecordCountOutputType
   */

  export type RecordCountOutputType = {
    recordItems: number
  }

  export type RecordCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recordItems?: boolean | RecordCountOutputTypeCountRecordItemsArgs
  }

  // Custom InputTypes
  /**
   * RecordCountOutputType without action
   */
  export type RecordCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordCountOutputType
     */
    select?: RecordCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RecordCountOutputType without action
   */
  export type RecordCountOutputTypeCountRecordItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecordItemWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    name: string | null
    mobile: string | null
    plan: string | null
    birthDate: string | null
    email: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    name: string | null
    mobile: string | null
    plan: string | null
    birthDate: string | null
    email: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    mobile: number
    plan: number
    birthDate: number
    email: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    mobile?: true
    plan?: true
    birthDate?: true
    email?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    mobile?: true
    plan?: true
    birthDate?: true
    email?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    mobile?: true
    plan?: true
    birthDate?: true
    email?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    name: string
    mobile: string
    plan: string
    birthDate: string
    email: string | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    mobile?: boolean
    plan?: boolean
    birthDate?: boolean
    email?: boolean
    records?: boolean | User$recordsArgs<ExtArgs>
    reels?: boolean | User$reelsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    mobile?: boolean
    plan?: boolean
    birthDate?: boolean
    email?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    mobile?: boolean
    plan?: boolean
    birthDate?: boolean
    email?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    mobile?: boolean
    plan?: boolean
    birthDate?: boolean
    email?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "mobile" | "plan" | "birthDate" | "email", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | User$recordsArgs<ExtArgs>
    reels?: boolean | User$reelsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      records: Prisma.$RecordPayload<ExtArgs>[]
      reels: Prisma.$ReelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      mobile: string
      plan: string
      birthDate: string
      email: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    records<T extends User$recordsArgs<ExtArgs> = {}>(args?: Subset<T, User$recordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    reels<T extends User$reelsArgs<ExtArgs> = {}>(args?: Subset<T, User$reelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly name: FieldRef<"User", 'String'>
    readonly mobile: FieldRef<"User", 'String'>
    readonly plan: FieldRef<"User", 'String'>
    readonly birthDate: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.records
   */
  export type User$recordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    where?: RecordWhereInput
    orderBy?: RecordOrderByWithRelationInput | RecordOrderByWithRelationInput[]
    cursor?: RecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RecordScalarFieldEnum | RecordScalarFieldEnum[]
  }

  /**
   * User.reels
   */
  export type User$reelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    where?: ReelWhereInput
    orderBy?: ReelOrderByWithRelationInput | ReelOrderByWithRelationInput[]
    cursor?: ReelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReelScalarFieldEnum | ReelScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Reel
   */

  export type AggregateReel = {
    _count: ReelCountAggregateOutputType | null
    _avg: ReelAvgAggregateOutputType | null
    _sum: ReelSumAggregateOutputType | null
    _min: ReelMinAggregateOutputType | null
    _max: ReelMaxAggregateOutputType | null
  }

  export type ReelAvgAggregateOutputType = {
    id: number | null
    lifestoryId: number | null
    userId: number | null
  }

  export type ReelSumAggregateOutputType = {
    id: number | null
    lifestoryId: number | null
    userId: number | null
  }

  export type ReelMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    identifier: string | null
    name: string | null
    birthDate: string | null
    profileImg: string | null
    birthPlace: string | null
    motto: string | null
    lifestoryId: number | null
    userId: number | null
  }

  export type ReelMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    identifier: string | null
    name: string | null
    birthDate: string | null
    profileImg: string | null
    birthPlace: string | null
    motto: string | null
    lifestoryId: number | null
    userId: number | null
  }

  export type ReelCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    identifier: number
    name: number
    birthDate: number
    profileImg: number
    birthPlace: number
    motto: number
    lifestoryId: number
    userId: number
    _all: number
  }


  export type ReelAvgAggregateInputType = {
    id?: true
    lifestoryId?: true
    userId?: true
  }

  export type ReelSumAggregateInputType = {
    id?: true
    lifestoryId?: true
    userId?: true
  }

  export type ReelMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    identifier?: true
    name?: true
    birthDate?: true
    profileImg?: true
    birthPlace?: true
    motto?: true
    lifestoryId?: true
    userId?: true
  }

  export type ReelMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    identifier?: true
    name?: true
    birthDate?: true
    profileImg?: true
    birthPlace?: true
    motto?: true
    lifestoryId?: true
    userId?: true
  }

  export type ReelCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    identifier?: true
    name?: true
    birthDate?: true
    profileImg?: true
    birthPlace?: true
    motto?: true
    lifestoryId?: true
    userId?: true
    _all?: true
  }

  export type ReelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Reel to aggregate.
     */
    where?: ReelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reels to fetch.
     */
    orderBy?: ReelOrderByWithRelationInput | ReelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Reels
    **/
    _count?: true | ReelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReelMaxAggregateInputType
  }

  export type GetReelAggregateType<T extends ReelAggregateArgs> = {
        [P in keyof T & keyof AggregateReel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReel[P]>
      : GetScalarType<T[P], AggregateReel[P]>
  }




  export type ReelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReelWhereInput
    orderBy?: ReelOrderByWithAggregationInput | ReelOrderByWithAggregationInput[]
    by: ReelScalarFieldEnum[] | ReelScalarFieldEnum
    having?: ReelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReelCountAggregateInputType | true
    _avg?: ReelAvgAggregateInputType
    _sum?: ReelSumAggregateInputType
    _min?: ReelMinAggregateInputType
    _max?: ReelMaxAggregateInputType
  }

  export type ReelGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    identifier: string
    name: string
    birthDate: string
    profileImg: string | null
    birthPlace: string | null
    motto: string | null
    lifestoryId: number | null
    userId: number | null
    _count: ReelCountAggregateOutputType | null
    _avg: ReelAvgAggregateOutputType | null
    _sum: ReelSumAggregateOutputType | null
    _min: ReelMinAggregateOutputType | null
    _max: ReelMaxAggregateOutputType | null
  }

  type GetReelGroupByPayload<T extends ReelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReelGroupByOutputType[P]>
            : GetScalarType<T[P], ReelGroupByOutputType[P]>
        }
      >
    >


  export type ReelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    identifier?: boolean
    name?: boolean
    birthDate?: boolean
    profileImg?: boolean
    birthPlace?: boolean
    motto?: boolean
    lifestoryId?: boolean
    userId?: boolean
    lifestory?: boolean | Reel$lifestoryArgs<ExtArgs>
    memorys?: boolean | Reel$memorysArgs<ExtArgs>
    user?: boolean | Reel$userArgs<ExtArgs>
    relationships?: boolean | Reel$relationshipsArgs<ExtArgs>
    childhood?: boolean | Reel$childhoodArgs<ExtArgs>
    _count?: boolean | ReelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reel"]>

  export type ReelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    identifier?: boolean
    name?: boolean
    birthDate?: boolean
    profileImg?: boolean
    birthPlace?: boolean
    motto?: boolean
    lifestoryId?: boolean
    userId?: boolean
    user?: boolean | Reel$userArgs<ExtArgs>
  }, ExtArgs["result"]["reel"]>

  export type ReelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    identifier?: boolean
    name?: boolean
    birthDate?: boolean
    profileImg?: boolean
    birthPlace?: boolean
    motto?: boolean
    lifestoryId?: boolean
    userId?: boolean
    user?: boolean | Reel$userArgs<ExtArgs>
  }, ExtArgs["result"]["reel"]>

  export type ReelSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    identifier?: boolean
    name?: boolean
    birthDate?: boolean
    profileImg?: boolean
    birthPlace?: boolean
    motto?: boolean
    lifestoryId?: boolean
    userId?: boolean
  }

  export type ReelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "identifier" | "name" | "birthDate" | "profileImg" | "birthPlace" | "motto" | "lifestoryId" | "userId", ExtArgs["result"]["reel"]>
  export type ReelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lifestory?: boolean | Reel$lifestoryArgs<ExtArgs>
    memorys?: boolean | Reel$memorysArgs<ExtArgs>
    user?: boolean | Reel$userArgs<ExtArgs>
    relationships?: boolean | Reel$relationshipsArgs<ExtArgs>
    childhood?: boolean | Reel$childhoodArgs<ExtArgs>
    _count?: boolean | ReelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Reel$userArgs<ExtArgs>
  }
  export type ReelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Reel$userArgs<ExtArgs>
  }

  export type $ReelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Reel"
    objects: {
      lifestory: Prisma.$LifestoryPayload<ExtArgs> | null
      memorys: Prisma.$MemoryPayload<ExtArgs>[]
      user: Prisma.$UserPayload<ExtArgs> | null
      relationships: Prisma.$RelationshipPayload<ExtArgs>[]
      childhood: Prisma.$WheelTexturePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      identifier: string
      name: string
      birthDate: string
      profileImg: string | null
      birthPlace: string | null
      motto: string | null
      lifestoryId: number | null
      userId: number | null
    }, ExtArgs["result"]["reel"]>
    composites: {}
  }

  type ReelGetPayload<S extends boolean | null | undefined | ReelDefaultArgs> = $Result.GetResult<Prisma.$ReelPayload, S>

  type ReelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReelCountAggregateInputType | true
    }

  export interface ReelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Reel'], meta: { name: 'Reel' } }
    /**
     * Find zero or one Reel that matches the filter.
     * @param {ReelFindUniqueArgs} args - Arguments to find a Reel
     * @example
     * // Get one Reel
     * const reel = await prisma.reel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReelFindUniqueArgs>(args: SelectSubset<T, ReelFindUniqueArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Reel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReelFindUniqueOrThrowArgs} args - Arguments to find a Reel
     * @example
     * // Get one Reel
     * const reel = await prisma.reel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReelFindUniqueOrThrowArgs>(args: SelectSubset<T, ReelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Reel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReelFindFirstArgs} args - Arguments to find a Reel
     * @example
     * // Get one Reel
     * const reel = await prisma.reel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReelFindFirstArgs>(args?: SelectSubset<T, ReelFindFirstArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Reel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReelFindFirstOrThrowArgs} args - Arguments to find a Reel
     * @example
     * // Get one Reel
     * const reel = await prisma.reel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReelFindFirstOrThrowArgs>(args?: SelectSubset<T, ReelFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Reels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Reels
     * const reels = await prisma.reel.findMany()
     * 
     * // Get first 10 Reels
     * const reels = await prisma.reel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reelWithIdOnly = await prisma.reel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReelFindManyArgs>(args?: SelectSubset<T, ReelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Reel.
     * @param {ReelCreateArgs} args - Arguments to create a Reel.
     * @example
     * // Create one Reel
     * const Reel = await prisma.reel.create({
     *   data: {
     *     // ... data to create a Reel
     *   }
     * })
     * 
     */
    create<T extends ReelCreateArgs>(args: SelectSubset<T, ReelCreateArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Reels.
     * @param {ReelCreateManyArgs} args - Arguments to create many Reels.
     * @example
     * // Create many Reels
     * const reel = await prisma.reel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReelCreateManyArgs>(args?: SelectSubset<T, ReelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Reels and returns the data saved in the database.
     * @param {ReelCreateManyAndReturnArgs} args - Arguments to create many Reels.
     * @example
     * // Create many Reels
     * const reel = await prisma.reel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Reels and only return the `id`
     * const reelWithIdOnly = await prisma.reel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReelCreateManyAndReturnArgs>(args?: SelectSubset<T, ReelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Reel.
     * @param {ReelDeleteArgs} args - Arguments to delete one Reel.
     * @example
     * // Delete one Reel
     * const Reel = await prisma.reel.delete({
     *   where: {
     *     // ... filter to delete one Reel
     *   }
     * })
     * 
     */
    delete<T extends ReelDeleteArgs>(args: SelectSubset<T, ReelDeleteArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Reel.
     * @param {ReelUpdateArgs} args - Arguments to update one Reel.
     * @example
     * // Update one Reel
     * const reel = await prisma.reel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReelUpdateArgs>(args: SelectSubset<T, ReelUpdateArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Reels.
     * @param {ReelDeleteManyArgs} args - Arguments to filter Reels to delete.
     * @example
     * // Delete a few Reels
     * const { count } = await prisma.reel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReelDeleteManyArgs>(args?: SelectSubset<T, ReelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Reels
     * const reel = await prisma.reel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReelUpdateManyArgs>(args: SelectSubset<T, ReelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reels and returns the data updated in the database.
     * @param {ReelUpdateManyAndReturnArgs} args - Arguments to update many Reels.
     * @example
     * // Update many Reels
     * const reel = await prisma.reel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Reels and only return the `id`
     * const reelWithIdOnly = await prisma.reel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReelUpdateManyAndReturnArgs>(args: SelectSubset<T, ReelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Reel.
     * @param {ReelUpsertArgs} args - Arguments to update or create a Reel.
     * @example
     * // Update or create a Reel
     * const reel = await prisma.reel.upsert({
     *   create: {
     *     // ... data to create a Reel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Reel we want to update
     *   }
     * })
     */
    upsert<T extends ReelUpsertArgs>(args: SelectSubset<T, ReelUpsertArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Reels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReelCountArgs} args - Arguments to filter Reels to count.
     * @example
     * // Count the number of Reels
     * const count = await prisma.reel.count({
     *   where: {
     *     // ... the filter for the Reels we want to count
     *   }
     * })
    **/
    count<T extends ReelCountArgs>(
      args?: Subset<T, ReelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Reel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReelAggregateArgs>(args: Subset<T, ReelAggregateArgs>): Prisma.PrismaPromise<GetReelAggregateType<T>>

    /**
     * Group by Reel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReelGroupByArgs['orderBy'] }
        : { orderBy?: ReelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Reel model
   */
  readonly fields: ReelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Reel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lifestory<T extends Reel$lifestoryArgs<ExtArgs> = {}>(args?: Subset<T, Reel$lifestoryArgs<ExtArgs>>): Prisma__LifestoryClient<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    memorys<T extends Reel$memorysArgs<ExtArgs> = {}>(args?: Subset<T, Reel$memorysArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    user<T extends Reel$userArgs<ExtArgs> = {}>(args?: Subset<T, Reel$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    relationships<T extends Reel$relationshipsArgs<ExtArgs> = {}>(args?: Subset<T, Reel$relationshipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    childhood<T extends Reel$childhoodArgs<ExtArgs> = {}>(args?: Subset<T, Reel$childhoodArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Reel model
   */
  interface ReelFieldRefs {
    readonly id: FieldRef<"Reel", 'Int'>
    readonly createdAt: FieldRef<"Reel", 'DateTime'>
    readonly updatedAt: FieldRef<"Reel", 'DateTime'>
    readonly identifier: FieldRef<"Reel", 'String'>
    readonly name: FieldRef<"Reel", 'String'>
    readonly birthDate: FieldRef<"Reel", 'String'>
    readonly profileImg: FieldRef<"Reel", 'String'>
    readonly birthPlace: FieldRef<"Reel", 'String'>
    readonly motto: FieldRef<"Reel", 'String'>
    readonly lifestoryId: FieldRef<"Reel", 'Int'>
    readonly userId: FieldRef<"Reel", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Reel findUnique
   */
  export type ReelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    /**
     * Filter, which Reel to fetch.
     */
    where: ReelWhereUniqueInput
  }

  /**
   * Reel findUniqueOrThrow
   */
  export type ReelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    /**
     * Filter, which Reel to fetch.
     */
    where: ReelWhereUniqueInput
  }

  /**
   * Reel findFirst
   */
  export type ReelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    /**
     * Filter, which Reel to fetch.
     */
    where?: ReelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reels to fetch.
     */
    orderBy?: ReelOrderByWithRelationInput | ReelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reels.
     */
    cursor?: ReelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reels.
     */
    distinct?: ReelScalarFieldEnum | ReelScalarFieldEnum[]
  }

  /**
   * Reel findFirstOrThrow
   */
  export type ReelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    /**
     * Filter, which Reel to fetch.
     */
    where?: ReelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reels to fetch.
     */
    orderBy?: ReelOrderByWithRelationInput | ReelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reels.
     */
    cursor?: ReelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reels.
     */
    distinct?: ReelScalarFieldEnum | ReelScalarFieldEnum[]
  }

  /**
   * Reel findMany
   */
  export type ReelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    /**
     * Filter, which Reels to fetch.
     */
    where?: ReelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reels to fetch.
     */
    orderBy?: ReelOrderByWithRelationInput | ReelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Reels.
     */
    cursor?: ReelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reels.
     */
    skip?: number
    distinct?: ReelScalarFieldEnum | ReelScalarFieldEnum[]
  }

  /**
   * Reel create
   */
  export type ReelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    /**
     * The data needed to create a Reel.
     */
    data: XOR<ReelCreateInput, ReelUncheckedCreateInput>
  }

  /**
   * Reel createMany
   */
  export type ReelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Reels.
     */
    data: ReelCreateManyInput | ReelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Reel createManyAndReturn
   */
  export type ReelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * The data used to create many Reels.
     */
    data: ReelCreateManyInput | ReelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Reel update
   */
  export type ReelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    /**
     * The data needed to update a Reel.
     */
    data: XOR<ReelUpdateInput, ReelUncheckedUpdateInput>
    /**
     * Choose, which Reel to update.
     */
    where: ReelWhereUniqueInput
  }

  /**
   * Reel updateMany
   */
  export type ReelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Reels.
     */
    data: XOR<ReelUpdateManyMutationInput, ReelUncheckedUpdateManyInput>
    /**
     * Filter which Reels to update
     */
    where?: ReelWhereInput
    /**
     * Limit how many Reels to update.
     */
    limit?: number
  }

  /**
   * Reel updateManyAndReturn
   */
  export type ReelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * The data used to update Reels.
     */
    data: XOR<ReelUpdateManyMutationInput, ReelUncheckedUpdateManyInput>
    /**
     * Filter which Reels to update
     */
    where?: ReelWhereInput
    /**
     * Limit how many Reels to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Reel upsert
   */
  export type ReelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    /**
     * The filter to search for the Reel to update in case it exists.
     */
    where: ReelWhereUniqueInput
    /**
     * In case the Reel found by the `where` argument doesn't exist, create a new Reel with this data.
     */
    create: XOR<ReelCreateInput, ReelUncheckedCreateInput>
    /**
     * In case the Reel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReelUpdateInput, ReelUncheckedUpdateInput>
  }

  /**
   * Reel delete
   */
  export type ReelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    /**
     * Filter which Reel to delete.
     */
    where: ReelWhereUniqueInput
  }

  /**
   * Reel deleteMany
   */
  export type ReelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Reels to delete
     */
    where?: ReelWhereInput
    /**
     * Limit how many Reels to delete.
     */
    limit?: number
  }

  /**
   * Reel.lifestory
   */
  export type Reel$lifestoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    where?: LifestoryWhereInput
  }

  /**
   * Reel.memorys
   */
  export type Reel$memorysArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    where?: MemoryWhereInput
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    cursor?: MemoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryScalarFieldEnum | MemoryScalarFieldEnum[]
  }

  /**
   * Reel.user
   */
  export type Reel$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Reel.relationships
   */
  export type Reel$relationshipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    where?: RelationshipWhereInput
    orderBy?: RelationshipOrderByWithRelationInput | RelationshipOrderByWithRelationInput[]
    cursor?: RelationshipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RelationshipScalarFieldEnum | RelationshipScalarFieldEnum[]
  }

  /**
   * Reel.childhood
   */
  export type Reel$childhoodArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    where?: WheelTextureWhereInput
    orderBy?: WheelTextureOrderByWithRelationInput | WheelTextureOrderByWithRelationInput[]
    cursor?: WheelTextureWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WheelTextureScalarFieldEnum | WheelTextureScalarFieldEnum[]
  }

  /**
   * Reel without action
   */
  export type ReelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
  }


  /**
   * Model Lifestory
   */

  export type AggregateLifestory = {
    _count: LifestoryCountAggregateOutputType | null
    _avg: LifestoryAvgAggregateOutputType | null
    _sum: LifestorySumAggregateOutputType | null
    _min: LifestoryMinAggregateOutputType | null
    _max: LifestoryMaxAggregateOutputType | null
  }

  export type LifestoryAvgAggregateOutputType = {
    id: number | null
    tokenUsage: number | null
    qaCount: number | null
    reelId: number | null
  }

  export type LifestorySumAggregateOutputType = {
    id: number | null
    tokenUsage: number | null
    qaCount: number | null
    reelId: number | null
  }

  export type LifestoryMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    tokenUsage: number | null
    mood: string | null
    qaCount: number | null
    result: string | null
    reelId: number | null
  }

  export type LifestoryMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    tokenUsage: number | null
    mood: string | null
    qaCount: number | null
    result: string | null
    reelId: number | null
  }

  export type LifestoryCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    tokenUsage: number
    mood: number
    qaCount: number
    qaList: number
    result: number
    reelId: number
    _all: number
  }


  export type LifestoryAvgAggregateInputType = {
    id?: true
    tokenUsage?: true
    qaCount?: true
    reelId?: true
  }

  export type LifestorySumAggregateInputType = {
    id?: true
    tokenUsage?: true
    qaCount?: true
    reelId?: true
  }

  export type LifestoryMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    tokenUsage?: true
    mood?: true
    qaCount?: true
    result?: true
    reelId?: true
  }

  export type LifestoryMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    tokenUsage?: true
    mood?: true
    qaCount?: true
    result?: true
    reelId?: true
  }

  export type LifestoryCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    tokenUsage?: true
    mood?: true
    qaCount?: true
    qaList?: true
    result?: true
    reelId?: true
    _all?: true
  }

  export type LifestoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Lifestory to aggregate.
     */
    where?: LifestoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lifestories to fetch.
     */
    orderBy?: LifestoryOrderByWithRelationInput | LifestoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LifestoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lifestories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lifestories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Lifestories
    **/
    _count?: true | LifestoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LifestoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LifestorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LifestoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LifestoryMaxAggregateInputType
  }

  export type GetLifestoryAggregateType<T extends LifestoryAggregateArgs> = {
        [P in keyof T & keyof AggregateLifestory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLifestory[P]>
      : GetScalarType<T[P], AggregateLifestory[P]>
  }




  export type LifestoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LifestoryWhereInput
    orderBy?: LifestoryOrderByWithAggregationInput | LifestoryOrderByWithAggregationInput[]
    by: LifestoryScalarFieldEnum[] | LifestoryScalarFieldEnum
    having?: LifestoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LifestoryCountAggregateInputType | true
    _avg?: LifestoryAvgAggregateInputType
    _sum?: LifestorySumAggregateInputType
    _min?: LifestoryMinAggregateInputType
    _max?: LifestoryMaxAggregateInputType
  }

  export type LifestoryGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    tokenUsage: number
    mood: string | null
    qaCount: number | null
    qaList: JsonValue | null
    result: string | null
    reelId: number
    _count: LifestoryCountAggregateOutputType | null
    _avg: LifestoryAvgAggregateOutputType | null
    _sum: LifestorySumAggregateOutputType | null
    _min: LifestoryMinAggregateOutputType | null
    _max: LifestoryMaxAggregateOutputType | null
  }

  type GetLifestoryGroupByPayload<T extends LifestoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LifestoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LifestoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LifestoryGroupByOutputType[P]>
            : GetScalarType<T[P], LifestoryGroupByOutputType[P]>
        }
      >
    >


  export type LifestorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tokenUsage?: boolean
    mood?: boolean
    qaCount?: boolean
    qaList?: boolean
    result?: boolean
    reelId?: boolean
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lifestory"]>

  export type LifestorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tokenUsage?: boolean
    mood?: boolean
    qaCount?: boolean
    qaList?: boolean
    result?: boolean
    reelId?: boolean
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lifestory"]>

  export type LifestorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tokenUsage?: boolean
    mood?: boolean
    qaCount?: boolean
    qaList?: boolean
    result?: boolean
    reelId?: boolean
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lifestory"]>

  export type LifestorySelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tokenUsage?: boolean
    mood?: boolean
    qaCount?: boolean
    qaList?: boolean
    result?: boolean
    reelId?: boolean
  }

  export type LifestoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "tokenUsage" | "mood" | "qaCount" | "qaList" | "result" | "reelId", ExtArgs["result"]["lifestory"]>
  export type LifestoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }
  export type LifestoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }
  export type LifestoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }

  export type $LifestoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Lifestory"
    objects: {
      reel: Prisma.$ReelPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      tokenUsage: number
      mood: string | null
      qaCount: number | null
      qaList: Prisma.JsonValue | null
      result: string | null
      reelId: number
    }, ExtArgs["result"]["lifestory"]>
    composites: {}
  }

  type LifestoryGetPayload<S extends boolean | null | undefined | LifestoryDefaultArgs> = $Result.GetResult<Prisma.$LifestoryPayload, S>

  type LifestoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LifestoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LifestoryCountAggregateInputType | true
    }

  export interface LifestoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Lifestory'], meta: { name: 'Lifestory' } }
    /**
     * Find zero or one Lifestory that matches the filter.
     * @param {LifestoryFindUniqueArgs} args - Arguments to find a Lifestory
     * @example
     * // Get one Lifestory
     * const lifestory = await prisma.lifestory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LifestoryFindUniqueArgs>(args: SelectSubset<T, LifestoryFindUniqueArgs<ExtArgs>>): Prisma__LifestoryClient<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Lifestory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LifestoryFindUniqueOrThrowArgs} args - Arguments to find a Lifestory
     * @example
     * // Get one Lifestory
     * const lifestory = await prisma.lifestory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LifestoryFindUniqueOrThrowArgs>(args: SelectSubset<T, LifestoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LifestoryClient<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lifestory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LifestoryFindFirstArgs} args - Arguments to find a Lifestory
     * @example
     * // Get one Lifestory
     * const lifestory = await prisma.lifestory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LifestoryFindFirstArgs>(args?: SelectSubset<T, LifestoryFindFirstArgs<ExtArgs>>): Prisma__LifestoryClient<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lifestory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LifestoryFindFirstOrThrowArgs} args - Arguments to find a Lifestory
     * @example
     * // Get one Lifestory
     * const lifestory = await prisma.lifestory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LifestoryFindFirstOrThrowArgs>(args?: SelectSubset<T, LifestoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__LifestoryClient<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Lifestories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LifestoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Lifestories
     * const lifestories = await prisma.lifestory.findMany()
     * 
     * // Get first 10 Lifestories
     * const lifestories = await prisma.lifestory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lifestoryWithIdOnly = await prisma.lifestory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LifestoryFindManyArgs>(args?: SelectSubset<T, LifestoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Lifestory.
     * @param {LifestoryCreateArgs} args - Arguments to create a Lifestory.
     * @example
     * // Create one Lifestory
     * const Lifestory = await prisma.lifestory.create({
     *   data: {
     *     // ... data to create a Lifestory
     *   }
     * })
     * 
     */
    create<T extends LifestoryCreateArgs>(args: SelectSubset<T, LifestoryCreateArgs<ExtArgs>>): Prisma__LifestoryClient<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Lifestories.
     * @param {LifestoryCreateManyArgs} args - Arguments to create many Lifestories.
     * @example
     * // Create many Lifestories
     * const lifestory = await prisma.lifestory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LifestoryCreateManyArgs>(args?: SelectSubset<T, LifestoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Lifestories and returns the data saved in the database.
     * @param {LifestoryCreateManyAndReturnArgs} args - Arguments to create many Lifestories.
     * @example
     * // Create many Lifestories
     * const lifestory = await prisma.lifestory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Lifestories and only return the `id`
     * const lifestoryWithIdOnly = await prisma.lifestory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LifestoryCreateManyAndReturnArgs>(args?: SelectSubset<T, LifestoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Lifestory.
     * @param {LifestoryDeleteArgs} args - Arguments to delete one Lifestory.
     * @example
     * // Delete one Lifestory
     * const Lifestory = await prisma.lifestory.delete({
     *   where: {
     *     // ... filter to delete one Lifestory
     *   }
     * })
     * 
     */
    delete<T extends LifestoryDeleteArgs>(args: SelectSubset<T, LifestoryDeleteArgs<ExtArgs>>): Prisma__LifestoryClient<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Lifestory.
     * @param {LifestoryUpdateArgs} args - Arguments to update one Lifestory.
     * @example
     * // Update one Lifestory
     * const lifestory = await prisma.lifestory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LifestoryUpdateArgs>(args: SelectSubset<T, LifestoryUpdateArgs<ExtArgs>>): Prisma__LifestoryClient<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Lifestories.
     * @param {LifestoryDeleteManyArgs} args - Arguments to filter Lifestories to delete.
     * @example
     * // Delete a few Lifestories
     * const { count } = await prisma.lifestory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LifestoryDeleteManyArgs>(args?: SelectSubset<T, LifestoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Lifestories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LifestoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Lifestories
     * const lifestory = await prisma.lifestory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LifestoryUpdateManyArgs>(args: SelectSubset<T, LifestoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Lifestories and returns the data updated in the database.
     * @param {LifestoryUpdateManyAndReturnArgs} args - Arguments to update many Lifestories.
     * @example
     * // Update many Lifestories
     * const lifestory = await prisma.lifestory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Lifestories and only return the `id`
     * const lifestoryWithIdOnly = await prisma.lifestory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LifestoryUpdateManyAndReturnArgs>(args: SelectSubset<T, LifestoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Lifestory.
     * @param {LifestoryUpsertArgs} args - Arguments to update or create a Lifestory.
     * @example
     * // Update or create a Lifestory
     * const lifestory = await prisma.lifestory.upsert({
     *   create: {
     *     // ... data to create a Lifestory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Lifestory we want to update
     *   }
     * })
     */
    upsert<T extends LifestoryUpsertArgs>(args: SelectSubset<T, LifestoryUpsertArgs<ExtArgs>>): Prisma__LifestoryClient<$Result.GetResult<Prisma.$LifestoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Lifestories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LifestoryCountArgs} args - Arguments to filter Lifestories to count.
     * @example
     * // Count the number of Lifestories
     * const count = await prisma.lifestory.count({
     *   where: {
     *     // ... the filter for the Lifestories we want to count
     *   }
     * })
    **/
    count<T extends LifestoryCountArgs>(
      args?: Subset<T, LifestoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LifestoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Lifestory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LifestoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LifestoryAggregateArgs>(args: Subset<T, LifestoryAggregateArgs>): Prisma.PrismaPromise<GetLifestoryAggregateType<T>>

    /**
     * Group by Lifestory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LifestoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LifestoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LifestoryGroupByArgs['orderBy'] }
        : { orderBy?: LifestoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LifestoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLifestoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Lifestory model
   */
  readonly fields: LifestoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Lifestory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LifestoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    reel<T extends ReelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReelDefaultArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Lifestory model
   */
  interface LifestoryFieldRefs {
    readonly id: FieldRef<"Lifestory", 'Int'>
    readonly createdAt: FieldRef<"Lifestory", 'DateTime'>
    readonly updatedAt: FieldRef<"Lifestory", 'DateTime'>
    readonly tokenUsage: FieldRef<"Lifestory", 'Int'>
    readonly mood: FieldRef<"Lifestory", 'String'>
    readonly qaCount: FieldRef<"Lifestory", 'Int'>
    readonly qaList: FieldRef<"Lifestory", 'Json'>
    readonly result: FieldRef<"Lifestory", 'String'>
    readonly reelId: FieldRef<"Lifestory", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Lifestory findUnique
   */
  export type LifestoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    /**
     * Filter, which Lifestory to fetch.
     */
    where: LifestoryWhereUniqueInput
  }

  /**
   * Lifestory findUniqueOrThrow
   */
  export type LifestoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    /**
     * Filter, which Lifestory to fetch.
     */
    where: LifestoryWhereUniqueInput
  }

  /**
   * Lifestory findFirst
   */
  export type LifestoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    /**
     * Filter, which Lifestory to fetch.
     */
    where?: LifestoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lifestories to fetch.
     */
    orderBy?: LifestoryOrderByWithRelationInput | LifestoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Lifestories.
     */
    cursor?: LifestoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lifestories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lifestories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Lifestories.
     */
    distinct?: LifestoryScalarFieldEnum | LifestoryScalarFieldEnum[]
  }

  /**
   * Lifestory findFirstOrThrow
   */
  export type LifestoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    /**
     * Filter, which Lifestory to fetch.
     */
    where?: LifestoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lifestories to fetch.
     */
    orderBy?: LifestoryOrderByWithRelationInput | LifestoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Lifestories.
     */
    cursor?: LifestoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lifestories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lifestories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Lifestories.
     */
    distinct?: LifestoryScalarFieldEnum | LifestoryScalarFieldEnum[]
  }

  /**
   * Lifestory findMany
   */
  export type LifestoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    /**
     * Filter, which Lifestories to fetch.
     */
    where?: LifestoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lifestories to fetch.
     */
    orderBy?: LifestoryOrderByWithRelationInput | LifestoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Lifestories.
     */
    cursor?: LifestoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lifestories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lifestories.
     */
    skip?: number
    distinct?: LifestoryScalarFieldEnum | LifestoryScalarFieldEnum[]
  }

  /**
   * Lifestory create
   */
  export type LifestoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Lifestory.
     */
    data: XOR<LifestoryCreateInput, LifestoryUncheckedCreateInput>
  }

  /**
   * Lifestory createMany
   */
  export type LifestoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Lifestories.
     */
    data: LifestoryCreateManyInput | LifestoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Lifestory createManyAndReturn
   */
  export type LifestoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * The data used to create many Lifestories.
     */
    data: LifestoryCreateManyInput | LifestoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Lifestory update
   */
  export type LifestoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Lifestory.
     */
    data: XOR<LifestoryUpdateInput, LifestoryUncheckedUpdateInput>
    /**
     * Choose, which Lifestory to update.
     */
    where: LifestoryWhereUniqueInput
  }

  /**
   * Lifestory updateMany
   */
  export type LifestoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Lifestories.
     */
    data: XOR<LifestoryUpdateManyMutationInput, LifestoryUncheckedUpdateManyInput>
    /**
     * Filter which Lifestories to update
     */
    where?: LifestoryWhereInput
    /**
     * Limit how many Lifestories to update.
     */
    limit?: number
  }

  /**
   * Lifestory updateManyAndReturn
   */
  export type LifestoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * The data used to update Lifestories.
     */
    data: XOR<LifestoryUpdateManyMutationInput, LifestoryUncheckedUpdateManyInput>
    /**
     * Filter which Lifestories to update
     */
    where?: LifestoryWhereInput
    /**
     * Limit how many Lifestories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Lifestory upsert
   */
  export type LifestoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Lifestory to update in case it exists.
     */
    where: LifestoryWhereUniqueInput
    /**
     * In case the Lifestory found by the `where` argument doesn't exist, create a new Lifestory with this data.
     */
    create: XOR<LifestoryCreateInput, LifestoryUncheckedCreateInput>
    /**
     * In case the Lifestory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LifestoryUpdateInput, LifestoryUncheckedUpdateInput>
  }

  /**
   * Lifestory delete
   */
  export type LifestoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
    /**
     * Filter which Lifestory to delete.
     */
    where: LifestoryWhereUniqueInput
  }

  /**
   * Lifestory deleteMany
   */
  export type LifestoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Lifestories to delete
     */
    where?: LifestoryWhereInput
    /**
     * Limit how many Lifestories to delete.
     */
    limit?: number
  }

  /**
   * Lifestory without action
   */
  export type LifestoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lifestory
     */
    select?: LifestorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lifestory
     */
    omit?: LifestoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LifestoryInclude<ExtArgs> | null
  }


  /**
   * Model WheelTexture
   */

  export type AggregateWheelTexture = {
    _count: WheelTextureCountAggregateOutputType | null
    _avg: WheelTextureAvgAggregateOutputType | null
    _sum: WheelTextureSumAggregateOutputType | null
    _min: WheelTextureMinAggregateOutputType | null
    _max: WheelTextureMaxAggregateOutputType | null
  }

  export type WheelTextureAvgAggregateOutputType = {
    id: number | null
    srcType: number | null
    memoryId: number | null
    relationshipId: number | null
    reelId: number | null
  }

  export type WheelTextureSumAggregateOutputType = {
    id: number | null
    srcType: number | null
    memoryId: number | null
    relationshipId: number | null
    reelId: number | null
  }

  export type WheelTextureMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    srcType: number | null
    srcUrl: string | null
    memoryId: number | null
    relationshipId: number | null
    caption: string | null
    reelId: number | null
  }

  export type WheelTextureMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    srcType: number | null
    srcUrl: string | null
    memoryId: number | null
    relationshipId: number | null
    caption: string | null
    reelId: number | null
  }

  export type WheelTextureCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    srcType: number
    srcUrl: number
    memoryId: number
    relationshipId: number
    caption: number
    reelId: number
    _all: number
  }


  export type WheelTextureAvgAggregateInputType = {
    id?: true
    srcType?: true
    memoryId?: true
    relationshipId?: true
    reelId?: true
  }

  export type WheelTextureSumAggregateInputType = {
    id?: true
    srcType?: true
    memoryId?: true
    relationshipId?: true
    reelId?: true
  }

  export type WheelTextureMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    srcType?: true
    srcUrl?: true
    memoryId?: true
    relationshipId?: true
    caption?: true
    reelId?: true
  }

  export type WheelTextureMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    srcType?: true
    srcUrl?: true
    memoryId?: true
    relationshipId?: true
    caption?: true
    reelId?: true
  }

  export type WheelTextureCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    srcType?: true
    srcUrl?: true
    memoryId?: true
    relationshipId?: true
    caption?: true
    reelId?: true
    _all?: true
  }

  export type WheelTextureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WheelTexture to aggregate.
     */
    where?: WheelTextureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WheelTextures to fetch.
     */
    orderBy?: WheelTextureOrderByWithRelationInput | WheelTextureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WheelTextureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WheelTextures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WheelTextures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WheelTextures
    **/
    _count?: true | WheelTextureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WheelTextureAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WheelTextureSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WheelTextureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WheelTextureMaxAggregateInputType
  }

  export type GetWheelTextureAggregateType<T extends WheelTextureAggregateArgs> = {
        [P in keyof T & keyof AggregateWheelTexture]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWheelTexture[P]>
      : GetScalarType<T[P], AggregateWheelTexture[P]>
  }




  export type WheelTextureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WheelTextureWhereInput
    orderBy?: WheelTextureOrderByWithAggregationInput | WheelTextureOrderByWithAggregationInput[]
    by: WheelTextureScalarFieldEnum[] | WheelTextureScalarFieldEnum
    having?: WheelTextureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WheelTextureCountAggregateInputType | true
    _avg?: WheelTextureAvgAggregateInputType
    _sum?: WheelTextureSumAggregateInputType
    _min?: WheelTextureMinAggregateInputType
    _max?: WheelTextureMaxAggregateInputType
  }

  export type WheelTextureGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    srcType: number
    srcUrl: string
    memoryId: number | null
    relationshipId: number | null
    caption: string | null
    reelId: number | null
    _count: WheelTextureCountAggregateOutputType | null
    _avg: WheelTextureAvgAggregateOutputType | null
    _sum: WheelTextureSumAggregateOutputType | null
    _min: WheelTextureMinAggregateOutputType | null
    _max: WheelTextureMaxAggregateOutputType | null
  }

  type GetWheelTextureGroupByPayload<T extends WheelTextureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WheelTextureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WheelTextureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WheelTextureGroupByOutputType[P]>
            : GetScalarType<T[P], WheelTextureGroupByOutputType[P]>
        }
      >
    >


  export type WheelTextureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    srcType?: boolean
    srcUrl?: boolean
    memoryId?: boolean
    relationshipId?: boolean
    caption?: boolean
    reelId?: boolean
    memory?: boolean | WheelTexture$memoryArgs<ExtArgs>
    reels?: boolean | WheelTexture$reelsArgs<ExtArgs>
    relationship?: boolean | WheelTexture$relationshipArgs<ExtArgs>
  }, ExtArgs["result"]["wheelTexture"]>

  export type WheelTextureSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    srcType?: boolean
    srcUrl?: boolean
    memoryId?: boolean
    relationshipId?: boolean
    caption?: boolean
    reelId?: boolean
    memory?: boolean | WheelTexture$memoryArgs<ExtArgs>
    reels?: boolean | WheelTexture$reelsArgs<ExtArgs>
    relationship?: boolean | WheelTexture$relationshipArgs<ExtArgs>
  }, ExtArgs["result"]["wheelTexture"]>

  export type WheelTextureSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    srcType?: boolean
    srcUrl?: boolean
    memoryId?: boolean
    relationshipId?: boolean
    caption?: boolean
    reelId?: boolean
    memory?: boolean | WheelTexture$memoryArgs<ExtArgs>
    reels?: boolean | WheelTexture$reelsArgs<ExtArgs>
    relationship?: boolean | WheelTexture$relationshipArgs<ExtArgs>
  }, ExtArgs["result"]["wheelTexture"]>

  export type WheelTextureSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    srcType?: boolean
    srcUrl?: boolean
    memoryId?: boolean
    relationshipId?: boolean
    caption?: boolean
    reelId?: boolean
  }

  export type WheelTextureOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "srcType" | "srcUrl" | "memoryId" | "relationshipId" | "caption" | "reelId", ExtArgs["result"]["wheelTexture"]>
  export type WheelTextureInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memory?: boolean | WheelTexture$memoryArgs<ExtArgs>
    reels?: boolean | WheelTexture$reelsArgs<ExtArgs>
    relationship?: boolean | WheelTexture$relationshipArgs<ExtArgs>
  }
  export type WheelTextureIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memory?: boolean | WheelTexture$memoryArgs<ExtArgs>
    reels?: boolean | WheelTexture$reelsArgs<ExtArgs>
    relationship?: boolean | WheelTexture$relationshipArgs<ExtArgs>
  }
  export type WheelTextureIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memory?: boolean | WheelTexture$memoryArgs<ExtArgs>
    reels?: boolean | WheelTexture$reelsArgs<ExtArgs>
    relationship?: boolean | WheelTexture$relationshipArgs<ExtArgs>
  }

  export type $WheelTexturePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WheelTexture"
    objects: {
      memory: Prisma.$MemoryPayload<ExtArgs> | null
      reels: Prisma.$ReelPayload<ExtArgs> | null
      relationship: Prisma.$RelationshipPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      srcType: number
      srcUrl: string
      memoryId: number | null
      relationshipId: number | null
      caption: string | null
      reelId: number | null
    }, ExtArgs["result"]["wheelTexture"]>
    composites: {}
  }

  type WheelTextureGetPayload<S extends boolean | null | undefined | WheelTextureDefaultArgs> = $Result.GetResult<Prisma.$WheelTexturePayload, S>

  type WheelTextureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WheelTextureFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WheelTextureCountAggregateInputType | true
    }

  export interface WheelTextureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WheelTexture'], meta: { name: 'WheelTexture' } }
    /**
     * Find zero or one WheelTexture that matches the filter.
     * @param {WheelTextureFindUniqueArgs} args - Arguments to find a WheelTexture
     * @example
     * // Get one WheelTexture
     * const wheelTexture = await prisma.wheelTexture.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WheelTextureFindUniqueArgs>(args: SelectSubset<T, WheelTextureFindUniqueArgs<ExtArgs>>): Prisma__WheelTextureClient<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WheelTexture that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WheelTextureFindUniqueOrThrowArgs} args - Arguments to find a WheelTexture
     * @example
     * // Get one WheelTexture
     * const wheelTexture = await prisma.wheelTexture.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WheelTextureFindUniqueOrThrowArgs>(args: SelectSubset<T, WheelTextureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WheelTextureClient<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WheelTexture that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WheelTextureFindFirstArgs} args - Arguments to find a WheelTexture
     * @example
     * // Get one WheelTexture
     * const wheelTexture = await prisma.wheelTexture.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WheelTextureFindFirstArgs>(args?: SelectSubset<T, WheelTextureFindFirstArgs<ExtArgs>>): Prisma__WheelTextureClient<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WheelTexture that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WheelTextureFindFirstOrThrowArgs} args - Arguments to find a WheelTexture
     * @example
     * // Get one WheelTexture
     * const wheelTexture = await prisma.wheelTexture.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WheelTextureFindFirstOrThrowArgs>(args?: SelectSubset<T, WheelTextureFindFirstOrThrowArgs<ExtArgs>>): Prisma__WheelTextureClient<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WheelTextures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WheelTextureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WheelTextures
     * const wheelTextures = await prisma.wheelTexture.findMany()
     * 
     * // Get first 10 WheelTextures
     * const wheelTextures = await prisma.wheelTexture.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const wheelTextureWithIdOnly = await prisma.wheelTexture.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WheelTextureFindManyArgs>(args?: SelectSubset<T, WheelTextureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WheelTexture.
     * @param {WheelTextureCreateArgs} args - Arguments to create a WheelTexture.
     * @example
     * // Create one WheelTexture
     * const WheelTexture = await prisma.wheelTexture.create({
     *   data: {
     *     // ... data to create a WheelTexture
     *   }
     * })
     * 
     */
    create<T extends WheelTextureCreateArgs>(args: SelectSubset<T, WheelTextureCreateArgs<ExtArgs>>): Prisma__WheelTextureClient<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WheelTextures.
     * @param {WheelTextureCreateManyArgs} args - Arguments to create many WheelTextures.
     * @example
     * // Create many WheelTextures
     * const wheelTexture = await prisma.wheelTexture.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WheelTextureCreateManyArgs>(args?: SelectSubset<T, WheelTextureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WheelTextures and returns the data saved in the database.
     * @param {WheelTextureCreateManyAndReturnArgs} args - Arguments to create many WheelTextures.
     * @example
     * // Create many WheelTextures
     * const wheelTexture = await prisma.wheelTexture.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WheelTextures and only return the `id`
     * const wheelTextureWithIdOnly = await prisma.wheelTexture.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WheelTextureCreateManyAndReturnArgs>(args?: SelectSubset<T, WheelTextureCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WheelTexture.
     * @param {WheelTextureDeleteArgs} args - Arguments to delete one WheelTexture.
     * @example
     * // Delete one WheelTexture
     * const WheelTexture = await prisma.wheelTexture.delete({
     *   where: {
     *     // ... filter to delete one WheelTexture
     *   }
     * })
     * 
     */
    delete<T extends WheelTextureDeleteArgs>(args: SelectSubset<T, WheelTextureDeleteArgs<ExtArgs>>): Prisma__WheelTextureClient<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WheelTexture.
     * @param {WheelTextureUpdateArgs} args - Arguments to update one WheelTexture.
     * @example
     * // Update one WheelTexture
     * const wheelTexture = await prisma.wheelTexture.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WheelTextureUpdateArgs>(args: SelectSubset<T, WheelTextureUpdateArgs<ExtArgs>>): Prisma__WheelTextureClient<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WheelTextures.
     * @param {WheelTextureDeleteManyArgs} args - Arguments to filter WheelTextures to delete.
     * @example
     * // Delete a few WheelTextures
     * const { count } = await prisma.wheelTexture.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WheelTextureDeleteManyArgs>(args?: SelectSubset<T, WheelTextureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WheelTextures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WheelTextureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WheelTextures
     * const wheelTexture = await prisma.wheelTexture.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WheelTextureUpdateManyArgs>(args: SelectSubset<T, WheelTextureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WheelTextures and returns the data updated in the database.
     * @param {WheelTextureUpdateManyAndReturnArgs} args - Arguments to update many WheelTextures.
     * @example
     * // Update many WheelTextures
     * const wheelTexture = await prisma.wheelTexture.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WheelTextures and only return the `id`
     * const wheelTextureWithIdOnly = await prisma.wheelTexture.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WheelTextureUpdateManyAndReturnArgs>(args: SelectSubset<T, WheelTextureUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WheelTexture.
     * @param {WheelTextureUpsertArgs} args - Arguments to update or create a WheelTexture.
     * @example
     * // Update or create a WheelTexture
     * const wheelTexture = await prisma.wheelTexture.upsert({
     *   create: {
     *     // ... data to create a WheelTexture
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WheelTexture we want to update
     *   }
     * })
     */
    upsert<T extends WheelTextureUpsertArgs>(args: SelectSubset<T, WheelTextureUpsertArgs<ExtArgs>>): Prisma__WheelTextureClient<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WheelTextures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WheelTextureCountArgs} args - Arguments to filter WheelTextures to count.
     * @example
     * // Count the number of WheelTextures
     * const count = await prisma.wheelTexture.count({
     *   where: {
     *     // ... the filter for the WheelTextures we want to count
     *   }
     * })
    **/
    count<T extends WheelTextureCountArgs>(
      args?: Subset<T, WheelTextureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WheelTextureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WheelTexture.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WheelTextureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WheelTextureAggregateArgs>(args: Subset<T, WheelTextureAggregateArgs>): Prisma.PrismaPromise<GetWheelTextureAggregateType<T>>

    /**
     * Group by WheelTexture.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WheelTextureGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WheelTextureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WheelTextureGroupByArgs['orderBy'] }
        : { orderBy?: WheelTextureGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WheelTextureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWheelTextureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WheelTexture model
   */
  readonly fields: WheelTextureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WheelTexture.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WheelTextureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    memory<T extends WheelTexture$memoryArgs<ExtArgs> = {}>(args?: Subset<T, WheelTexture$memoryArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    reels<T extends WheelTexture$reelsArgs<ExtArgs> = {}>(args?: Subset<T, WheelTexture$reelsArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    relationship<T extends WheelTexture$relationshipArgs<ExtArgs> = {}>(args?: Subset<T, WheelTexture$relationshipArgs<ExtArgs>>): Prisma__RelationshipClient<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WheelTexture model
   */
  interface WheelTextureFieldRefs {
    readonly id: FieldRef<"WheelTexture", 'Int'>
    readonly createdAt: FieldRef<"WheelTexture", 'DateTime'>
    readonly updatedAt: FieldRef<"WheelTexture", 'DateTime'>
    readonly srcType: FieldRef<"WheelTexture", 'Int'>
    readonly srcUrl: FieldRef<"WheelTexture", 'String'>
    readonly memoryId: FieldRef<"WheelTexture", 'Int'>
    readonly relationshipId: FieldRef<"WheelTexture", 'Int'>
    readonly caption: FieldRef<"WheelTexture", 'String'>
    readonly reelId: FieldRef<"WheelTexture", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * WheelTexture findUnique
   */
  export type WheelTextureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    /**
     * Filter, which WheelTexture to fetch.
     */
    where: WheelTextureWhereUniqueInput
  }

  /**
   * WheelTexture findUniqueOrThrow
   */
  export type WheelTextureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    /**
     * Filter, which WheelTexture to fetch.
     */
    where: WheelTextureWhereUniqueInput
  }

  /**
   * WheelTexture findFirst
   */
  export type WheelTextureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    /**
     * Filter, which WheelTexture to fetch.
     */
    where?: WheelTextureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WheelTextures to fetch.
     */
    orderBy?: WheelTextureOrderByWithRelationInput | WheelTextureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WheelTextures.
     */
    cursor?: WheelTextureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WheelTextures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WheelTextures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WheelTextures.
     */
    distinct?: WheelTextureScalarFieldEnum | WheelTextureScalarFieldEnum[]
  }

  /**
   * WheelTexture findFirstOrThrow
   */
  export type WheelTextureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    /**
     * Filter, which WheelTexture to fetch.
     */
    where?: WheelTextureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WheelTextures to fetch.
     */
    orderBy?: WheelTextureOrderByWithRelationInput | WheelTextureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WheelTextures.
     */
    cursor?: WheelTextureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WheelTextures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WheelTextures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WheelTextures.
     */
    distinct?: WheelTextureScalarFieldEnum | WheelTextureScalarFieldEnum[]
  }

  /**
   * WheelTexture findMany
   */
  export type WheelTextureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    /**
     * Filter, which WheelTextures to fetch.
     */
    where?: WheelTextureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WheelTextures to fetch.
     */
    orderBy?: WheelTextureOrderByWithRelationInput | WheelTextureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WheelTextures.
     */
    cursor?: WheelTextureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WheelTextures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WheelTextures.
     */
    skip?: number
    distinct?: WheelTextureScalarFieldEnum | WheelTextureScalarFieldEnum[]
  }

  /**
   * WheelTexture create
   */
  export type WheelTextureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    /**
     * The data needed to create a WheelTexture.
     */
    data: XOR<WheelTextureCreateInput, WheelTextureUncheckedCreateInput>
  }

  /**
   * WheelTexture createMany
   */
  export type WheelTextureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WheelTextures.
     */
    data: WheelTextureCreateManyInput | WheelTextureCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WheelTexture createManyAndReturn
   */
  export type WheelTextureCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * The data used to create many WheelTextures.
     */
    data: WheelTextureCreateManyInput | WheelTextureCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WheelTexture update
   */
  export type WheelTextureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    /**
     * The data needed to update a WheelTexture.
     */
    data: XOR<WheelTextureUpdateInput, WheelTextureUncheckedUpdateInput>
    /**
     * Choose, which WheelTexture to update.
     */
    where: WheelTextureWhereUniqueInput
  }

  /**
   * WheelTexture updateMany
   */
  export type WheelTextureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WheelTextures.
     */
    data: XOR<WheelTextureUpdateManyMutationInput, WheelTextureUncheckedUpdateManyInput>
    /**
     * Filter which WheelTextures to update
     */
    where?: WheelTextureWhereInput
    /**
     * Limit how many WheelTextures to update.
     */
    limit?: number
  }

  /**
   * WheelTexture updateManyAndReturn
   */
  export type WheelTextureUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * The data used to update WheelTextures.
     */
    data: XOR<WheelTextureUpdateManyMutationInput, WheelTextureUncheckedUpdateManyInput>
    /**
     * Filter which WheelTextures to update
     */
    where?: WheelTextureWhereInput
    /**
     * Limit how many WheelTextures to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WheelTexture upsert
   */
  export type WheelTextureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    /**
     * The filter to search for the WheelTexture to update in case it exists.
     */
    where: WheelTextureWhereUniqueInput
    /**
     * In case the WheelTexture found by the `where` argument doesn't exist, create a new WheelTexture with this data.
     */
    create: XOR<WheelTextureCreateInput, WheelTextureUncheckedCreateInput>
    /**
     * In case the WheelTexture was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WheelTextureUpdateInput, WheelTextureUncheckedUpdateInput>
  }

  /**
   * WheelTexture delete
   */
  export type WheelTextureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    /**
     * Filter which WheelTexture to delete.
     */
    where: WheelTextureWhereUniqueInput
  }

  /**
   * WheelTexture deleteMany
   */
  export type WheelTextureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WheelTextures to delete
     */
    where?: WheelTextureWhereInput
    /**
     * Limit how many WheelTextures to delete.
     */
    limit?: number
  }

  /**
   * WheelTexture.memory
   */
  export type WheelTexture$memoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    where?: MemoryWhereInput
  }

  /**
   * WheelTexture.reels
   */
  export type WheelTexture$reelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    where?: ReelWhereInput
  }

  /**
   * WheelTexture.relationship
   */
  export type WheelTexture$relationshipArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    where?: RelationshipWhereInput
  }

  /**
   * WheelTexture without action
   */
  export type WheelTextureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
  }


  /**
   * Model Memory
   */

  export type AggregateMemory = {
    _count: MemoryCountAggregateOutputType | null
    _avg: MemoryAvgAggregateOutputType | null
    _sum: MemorySumAggregateOutputType | null
    _min: MemoryMinAggregateOutputType | null
    _max: MemoryMaxAggregateOutputType | null
  }

  export type MemoryAvgAggregateOutputType = {
    id: number | null
    reelId: number | null
  }

  export type MemorySumAggregateOutputType = {
    id: number | null
    reelId: number | null
  }

  export type MemoryMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    title: string | null
    subTitle: string | null
    date: Date | null
    comment: string | null
    reelId: number | null
  }

  export type MemoryMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    title: string | null
    subTitle: string | null
    date: Date | null
    comment: string | null
    reelId: number | null
  }

  export type MemoryCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    title: number
    subTitle: number
    date: number
    comment: number
    reelId: number
    _all: number
  }


  export type MemoryAvgAggregateInputType = {
    id?: true
    reelId?: true
  }

  export type MemorySumAggregateInputType = {
    id?: true
    reelId?: true
  }

  export type MemoryMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    subTitle?: true
    date?: true
    comment?: true
    reelId?: true
  }

  export type MemoryMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    subTitle?: true
    date?: true
    comment?: true
    reelId?: true
  }

  export type MemoryCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    subTitle?: true
    date?: true
    comment?: true
    reelId?: true
    _all?: true
  }

  export type MemoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Memory to aggregate.
     */
    where?: MemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memories to fetch.
     */
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Memories
    **/
    _count?: true | MemoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MemoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MemorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryMaxAggregateInputType
  }

  export type GetMemoryAggregateType<T extends MemoryAggregateArgs> = {
        [P in keyof T & keyof AggregateMemory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemory[P]>
      : GetScalarType<T[P], AggregateMemory[P]>
  }




  export type MemoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryWhereInput
    orderBy?: MemoryOrderByWithAggregationInput | MemoryOrderByWithAggregationInput[]
    by: MemoryScalarFieldEnum[] | MemoryScalarFieldEnum
    having?: MemoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryCountAggregateInputType | true
    _avg?: MemoryAvgAggregateInputType
    _sum?: MemorySumAggregateInputType
    _min?: MemoryMinAggregateInputType
    _max?: MemoryMaxAggregateInputType
  }

  export type MemoryGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    title: string
    subTitle: string | null
    date: Date | null
    comment: string | null
    reelId: number
    _count: MemoryCountAggregateOutputType | null
    _avg: MemoryAvgAggregateOutputType | null
    _sum: MemorySumAggregateOutputType | null
    _min: MemoryMinAggregateOutputType | null
    _max: MemoryMaxAggregateOutputType | null
  }

  type GetMemoryGroupByPayload<T extends MemoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryGroupByOutputType[P]>
        }
      >
    >


  export type MemorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    subTitle?: boolean
    date?: boolean
    comment?: boolean
    reelId?: boolean
    reel?: boolean | ReelDefaultArgs<ExtArgs>
    wheelTextures?: boolean | Memory$wheelTexturesArgs<ExtArgs>
    _count?: boolean | MemoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memory"]>

  export type MemorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    subTitle?: boolean
    date?: boolean
    comment?: boolean
    reelId?: boolean
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memory"]>

  export type MemorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    subTitle?: boolean
    date?: boolean
    comment?: boolean
    reelId?: boolean
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memory"]>

  export type MemorySelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    subTitle?: boolean
    date?: boolean
    comment?: boolean
    reelId?: boolean
  }

  export type MemoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "title" | "subTitle" | "date" | "comment" | "reelId", ExtArgs["result"]["memory"]>
  export type MemoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reel?: boolean | ReelDefaultArgs<ExtArgs>
    wheelTextures?: boolean | Memory$wheelTexturesArgs<ExtArgs>
    _count?: boolean | MemoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MemoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }
  export type MemoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reel?: boolean | ReelDefaultArgs<ExtArgs>
  }

  export type $MemoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Memory"
    objects: {
      reel: Prisma.$ReelPayload<ExtArgs>
      wheelTextures: Prisma.$WheelTexturePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      title: string
      subTitle: string | null
      date: Date | null
      comment: string | null
      reelId: number
    }, ExtArgs["result"]["memory"]>
    composites: {}
  }

  type MemoryGetPayload<S extends boolean | null | undefined | MemoryDefaultArgs> = $Result.GetResult<Prisma.$MemoryPayload, S>

  type MemoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemoryCountAggregateInputType | true
    }

  export interface MemoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Memory'], meta: { name: 'Memory' } }
    /**
     * Find zero or one Memory that matches the filter.
     * @param {MemoryFindUniqueArgs} args - Arguments to find a Memory
     * @example
     * // Get one Memory
     * const memory = await prisma.memory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryFindUniqueArgs>(args: SelectSubset<T, MemoryFindUniqueArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Memory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemoryFindUniqueOrThrowArgs} args - Arguments to find a Memory
     * @example
     * // Get one Memory
     * const memory = await prisma.memory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Memory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryFindFirstArgs} args - Arguments to find a Memory
     * @example
     * // Get one Memory
     * const memory = await prisma.memory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryFindFirstArgs>(args?: SelectSubset<T, MemoryFindFirstArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Memory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryFindFirstOrThrowArgs} args - Arguments to find a Memory
     * @example
     * // Get one Memory
     * const memory = await prisma.memory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Memories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Memories
     * const memories = await prisma.memory.findMany()
     * 
     * // Get first 10 Memories
     * const memories = await prisma.memory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryWithIdOnly = await prisma.memory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryFindManyArgs>(args?: SelectSubset<T, MemoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Memory.
     * @param {MemoryCreateArgs} args - Arguments to create a Memory.
     * @example
     * // Create one Memory
     * const Memory = await prisma.memory.create({
     *   data: {
     *     // ... data to create a Memory
     *   }
     * })
     * 
     */
    create<T extends MemoryCreateArgs>(args: SelectSubset<T, MemoryCreateArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Memories.
     * @param {MemoryCreateManyArgs} args - Arguments to create many Memories.
     * @example
     * // Create many Memories
     * const memory = await prisma.memory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryCreateManyArgs>(args?: SelectSubset<T, MemoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Memories and returns the data saved in the database.
     * @param {MemoryCreateManyAndReturnArgs} args - Arguments to create many Memories.
     * @example
     * // Create many Memories
     * const memory = await prisma.memory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Memories and only return the `id`
     * const memoryWithIdOnly = await prisma.memory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Memory.
     * @param {MemoryDeleteArgs} args - Arguments to delete one Memory.
     * @example
     * // Delete one Memory
     * const Memory = await prisma.memory.delete({
     *   where: {
     *     // ... filter to delete one Memory
     *   }
     * })
     * 
     */
    delete<T extends MemoryDeleteArgs>(args: SelectSubset<T, MemoryDeleteArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Memory.
     * @param {MemoryUpdateArgs} args - Arguments to update one Memory.
     * @example
     * // Update one Memory
     * const memory = await prisma.memory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryUpdateArgs>(args: SelectSubset<T, MemoryUpdateArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Memories.
     * @param {MemoryDeleteManyArgs} args - Arguments to filter Memories to delete.
     * @example
     * // Delete a few Memories
     * const { count } = await prisma.memory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryDeleteManyArgs>(args?: SelectSubset<T, MemoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Memories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Memories
     * const memory = await prisma.memory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryUpdateManyArgs>(args: SelectSubset<T, MemoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Memories and returns the data updated in the database.
     * @param {MemoryUpdateManyAndReturnArgs} args - Arguments to update many Memories.
     * @example
     * // Update many Memories
     * const memory = await prisma.memory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Memories and only return the `id`
     * const memoryWithIdOnly = await prisma.memory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemoryUpdateManyAndReturnArgs>(args: SelectSubset<T, MemoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Memory.
     * @param {MemoryUpsertArgs} args - Arguments to update or create a Memory.
     * @example
     * // Update or create a Memory
     * const memory = await prisma.memory.upsert({
     *   create: {
     *     // ... data to create a Memory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Memory we want to update
     *   }
     * })
     */
    upsert<T extends MemoryUpsertArgs>(args: SelectSubset<T, MemoryUpsertArgs<ExtArgs>>): Prisma__MemoryClient<$Result.GetResult<Prisma.$MemoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Memories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryCountArgs} args - Arguments to filter Memories to count.
     * @example
     * // Count the number of Memories
     * const count = await prisma.memory.count({
     *   where: {
     *     // ... the filter for the Memories we want to count
     *   }
     * })
    **/
    count<T extends MemoryCountArgs>(
      args?: Subset<T, MemoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Memory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryAggregateArgs>(args: Subset<T, MemoryAggregateArgs>): Prisma.PrismaPromise<GetMemoryAggregateType<T>>

    /**
     * Group by Memory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryGroupByArgs['orderBy'] }
        : { orderBy?: MemoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Memory model
   */
  readonly fields: MemoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Memory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    reel<T extends ReelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReelDefaultArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    wheelTextures<T extends Memory$wheelTexturesArgs<ExtArgs> = {}>(args?: Subset<T, Memory$wheelTexturesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Memory model
   */
  interface MemoryFieldRefs {
    readonly id: FieldRef<"Memory", 'Int'>
    readonly createdAt: FieldRef<"Memory", 'DateTime'>
    readonly updatedAt: FieldRef<"Memory", 'DateTime'>
    readonly title: FieldRef<"Memory", 'String'>
    readonly subTitle: FieldRef<"Memory", 'String'>
    readonly date: FieldRef<"Memory", 'DateTime'>
    readonly comment: FieldRef<"Memory", 'String'>
    readonly reelId: FieldRef<"Memory", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Memory findUnique
   */
  export type MemoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memory to fetch.
     */
    where: MemoryWhereUniqueInput
  }

  /**
   * Memory findUniqueOrThrow
   */
  export type MemoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memory to fetch.
     */
    where: MemoryWhereUniqueInput
  }

  /**
   * Memory findFirst
   */
  export type MemoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memory to fetch.
     */
    where?: MemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memories to fetch.
     */
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Memories.
     */
    cursor?: MemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Memories.
     */
    distinct?: MemoryScalarFieldEnum | MemoryScalarFieldEnum[]
  }

  /**
   * Memory findFirstOrThrow
   */
  export type MemoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memory to fetch.
     */
    where?: MemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memories to fetch.
     */
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Memories.
     */
    cursor?: MemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Memories.
     */
    distinct?: MemoryScalarFieldEnum | MemoryScalarFieldEnum[]
  }

  /**
   * Memory findMany
   */
  export type MemoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter, which Memories to fetch.
     */
    where?: MemoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memories to fetch.
     */
    orderBy?: MemoryOrderByWithRelationInput | MemoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Memories.
     */
    cursor?: MemoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memories.
     */
    skip?: number
    distinct?: MemoryScalarFieldEnum | MemoryScalarFieldEnum[]
  }

  /**
   * Memory create
   */
  export type MemoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Memory.
     */
    data: XOR<MemoryCreateInput, MemoryUncheckedCreateInput>
  }

  /**
   * Memory createMany
   */
  export type MemoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Memories.
     */
    data: MemoryCreateManyInput | MemoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Memory createManyAndReturn
   */
  export type MemoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * The data used to create many Memories.
     */
    data: MemoryCreateManyInput | MemoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Memory update
   */
  export type MemoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Memory.
     */
    data: XOR<MemoryUpdateInput, MemoryUncheckedUpdateInput>
    /**
     * Choose, which Memory to update.
     */
    where: MemoryWhereUniqueInput
  }

  /**
   * Memory updateMany
   */
  export type MemoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Memories.
     */
    data: XOR<MemoryUpdateManyMutationInput, MemoryUncheckedUpdateManyInput>
    /**
     * Filter which Memories to update
     */
    where?: MemoryWhereInput
    /**
     * Limit how many Memories to update.
     */
    limit?: number
  }

  /**
   * Memory updateManyAndReturn
   */
  export type MemoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * The data used to update Memories.
     */
    data: XOR<MemoryUpdateManyMutationInput, MemoryUncheckedUpdateManyInput>
    /**
     * Filter which Memories to update
     */
    where?: MemoryWhereInput
    /**
     * Limit how many Memories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Memory upsert
   */
  export type MemoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Memory to update in case it exists.
     */
    where: MemoryWhereUniqueInput
    /**
     * In case the Memory found by the `where` argument doesn't exist, create a new Memory with this data.
     */
    create: XOR<MemoryCreateInput, MemoryUncheckedCreateInput>
    /**
     * In case the Memory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryUpdateInput, MemoryUncheckedUpdateInput>
  }

  /**
   * Memory delete
   */
  export type MemoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
    /**
     * Filter which Memory to delete.
     */
    where: MemoryWhereUniqueInput
  }

  /**
   * Memory deleteMany
   */
  export type MemoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Memories to delete
     */
    where?: MemoryWhereInput
    /**
     * Limit how many Memories to delete.
     */
    limit?: number
  }

  /**
   * Memory.wheelTextures
   */
  export type Memory$wheelTexturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    where?: WheelTextureWhereInput
    orderBy?: WheelTextureOrderByWithRelationInput | WheelTextureOrderByWithRelationInput[]
    cursor?: WheelTextureWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WheelTextureScalarFieldEnum | WheelTextureScalarFieldEnum[]
  }

  /**
   * Memory without action
   */
  export type MemoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Memory
     */
    select?: MemorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Memory
     */
    omit?: MemoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryInclude<ExtArgs> | null
  }


  /**
   * Model Relationship
   */

  export type AggregateRelationship = {
    _count: RelationshipCountAggregateOutputType | null
    _avg: RelationshipAvgAggregateOutputType | null
    _sum: RelationshipSumAggregateOutputType | null
    _min: RelationshipMinAggregateOutputType | null
    _max: RelationshipMaxAggregateOutputType | null
  }

  export type RelationshipAvgAggregateOutputType = {
    id: number | null
    reelId: number | null
  }

  export type RelationshipSumAggregateOutputType = {
    id: number | null
    reelId: number | null
  }

  export type RelationshipMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    relation: string | null
    comment: string | null
    reelId: number | null
  }

  export type RelationshipMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    relation: string | null
    comment: string | null
    reelId: number | null
  }

  export type RelationshipCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    name: number
    relation: number
    comment: number
    reelId: number
    _all: number
  }


  export type RelationshipAvgAggregateInputType = {
    id?: true
    reelId?: true
  }

  export type RelationshipSumAggregateInputType = {
    id?: true
    reelId?: true
  }

  export type RelationshipMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    relation?: true
    comment?: true
    reelId?: true
  }

  export type RelationshipMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    relation?: true
    comment?: true
    reelId?: true
  }

  export type RelationshipCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    relation?: true
    comment?: true
    reelId?: true
    _all?: true
  }

  export type RelationshipAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Relationship to aggregate.
     */
    where?: RelationshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Relationships to fetch.
     */
    orderBy?: RelationshipOrderByWithRelationInput | RelationshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RelationshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Relationships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Relationships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Relationships
    **/
    _count?: true | RelationshipCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RelationshipAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RelationshipSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RelationshipMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RelationshipMaxAggregateInputType
  }

  export type GetRelationshipAggregateType<T extends RelationshipAggregateArgs> = {
        [P in keyof T & keyof AggregateRelationship]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRelationship[P]>
      : GetScalarType<T[P], AggregateRelationship[P]>
  }




  export type RelationshipGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RelationshipWhereInput
    orderBy?: RelationshipOrderByWithAggregationInput | RelationshipOrderByWithAggregationInput[]
    by: RelationshipScalarFieldEnum[] | RelationshipScalarFieldEnum
    having?: RelationshipScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RelationshipCountAggregateInputType | true
    _avg?: RelationshipAvgAggregateInputType
    _sum?: RelationshipSumAggregateInputType
    _min?: RelationshipMinAggregateInputType
    _max?: RelationshipMaxAggregateInputType
  }

  export type RelationshipGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    name: string
    relation: string
    comment: string | null
    reelId: number | null
    _count: RelationshipCountAggregateOutputType | null
    _avg: RelationshipAvgAggregateOutputType | null
    _sum: RelationshipSumAggregateOutputType | null
    _min: RelationshipMinAggregateOutputType | null
    _max: RelationshipMaxAggregateOutputType | null
  }

  type GetRelationshipGroupByPayload<T extends RelationshipGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RelationshipGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RelationshipGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RelationshipGroupByOutputType[P]>
            : GetScalarType<T[P], RelationshipGroupByOutputType[P]>
        }
      >
    >


  export type RelationshipSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    relation?: boolean
    comment?: boolean
    reelId?: boolean
    reels?: boolean | Relationship$reelsArgs<ExtArgs>
    wheelTextures?: boolean | Relationship$wheelTexturesArgs<ExtArgs>
    _count?: boolean | RelationshipCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["relationship"]>

  export type RelationshipSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    relation?: boolean
    comment?: boolean
    reelId?: boolean
    reels?: boolean | Relationship$reelsArgs<ExtArgs>
  }, ExtArgs["result"]["relationship"]>

  export type RelationshipSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    relation?: boolean
    comment?: boolean
    reelId?: boolean
    reels?: boolean | Relationship$reelsArgs<ExtArgs>
  }, ExtArgs["result"]["relationship"]>

  export type RelationshipSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    relation?: boolean
    comment?: boolean
    reelId?: boolean
  }

  export type RelationshipOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "name" | "relation" | "comment" | "reelId", ExtArgs["result"]["relationship"]>
  export type RelationshipInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reels?: boolean | Relationship$reelsArgs<ExtArgs>
    wheelTextures?: boolean | Relationship$wheelTexturesArgs<ExtArgs>
    _count?: boolean | RelationshipCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RelationshipIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reels?: boolean | Relationship$reelsArgs<ExtArgs>
  }
  export type RelationshipIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    reels?: boolean | Relationship$reelsArgs<ExtArgs>
  }

  export type $RelationshipPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Relationship"
    objects: {
      reels: Prisma.$ReelPayload<ExtArgs> | null
      wheelTextures: Prisma.$WheelTexturePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      name: string
      relation: string
      comment: string | null
      reelId: number | null
    }, ExtArgs["result"]["relationship"]>
    composites: {}
  }

  type RelationshipGetPayload<S extends boolean | null | undefined | RelationshipDefaultArgs> = $Result.GetResult<Prisma.$RelationshipPayload, S>

  type RelationshipCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RelationshipFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RelationshipCountAggregateInputType | true
    }

  export interface RelationshipDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Relationship'], meta: { name: 'Relationship' } }
    /**
     * Find zero or one Relationship that matches the filter.
     * @param {RelationshipFindUniqueArgs} args - Arguments to find a Relationship
     * @example
     * // Get one Relationship
     * const relationship = await prisma.relationship.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RelationshipFindUniqueArgs>(args: SelectSubset<T, RelationshipFindUniqueArgs<ExtArgs>>): Prisma__RelationshipClient<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Relationship that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RelationshipFindUniqueOrThrowArgs} args - Arguments to find a Relationship
     * @example
     * // Get one Relationship
     * const relationship = await prisma.relationship.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RelationshipFindUniqueOrThrowArgs>(args: SelectSubset<T, RelationshipFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RelationshipClient<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Relationship that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipFindFirstArgs} args - Arguments to find a Relationship
     * @example
     * // Get one Relationship
     * const relationship = await prisma.relationship.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RelationshipFindFirstArgs>(args?: SelectSubset<T, RelationshipFindFirstArgs<ExtArgs>>): Prisma__RelationshipClient<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Relationship that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipFindFirstOrThrowArgs} args - Arguments to find a Relationship
     * @example
     * // Get one Relationship
     * const relationship = await prisma.relationship.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RelationshipFindFirstOrThrowArgs>(args?: SelectSubset<T, RelationshipFindFirstOrThrowArgs<ExtArgs>>): Prisma__RelationshipClient<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Relationships that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Relationships
     * const relationships = await prisma.relationship.findMany()
     * 
     * // Get first 10 Relationships
     * const relationships = await prisma.relationship.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const relationshipWithIdOnly = await prisma.relationship.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RelationshipFindManyArgs>(args?: SelectSubset<T, RelationshipFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Relationship.
     * @param {RelationshipCreateArgs} args - Arguments to create a Relationship.
     * @example
     * // Create one Relationship
     * const Relationship = await prisma.relationship.create({
     *   data: {
     *     // ... data to create a Relationship
     *   }
     * })
     * 
     */
    create<T extends RelationshipCreateArgs>(args: SelectSubset<T, RelationshipCreateArgs<ExtArgs>>): Prisma__RelationshipClient<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Relationships.
     * @param {RelationshipCreateManyArgs} args - Arguments to create many Relationships.
     * @example
     * // Create many Relationships
     * const relationship = await prisma.relationship.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RelationshipCreateManyArgs>(args?: SelectSubset<T, RelationshipCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Relationships and returns the data saved in the database.
     * @param {RelationshipCreateManyAndReturnArgs} args - Arguments to create many Relationships.
     * @example
     * // Create many Relationships
     * const relationship = await prisma.relationship.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Relationships and only return the `id`
     * const relationshipWithIdOnly = await prisma.relationship.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RelationshipCreateManyAndReturnArgs>(args?: SelectSubset<T, RelationshipCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Relationship.
     * @param {RelationshipDeleteArgs} args - Arguments to delete one Relationship.
     * @example
     * // Delete one Relationship
     * const Relationship = await prisma.relationship.delete({
     *   where: {
     *     // ... filter to delete one Relationship
     *   }
     * })
     * 
     */
    delete<T extends RelationshipDeleteArgs>(args: SelectSubset<T, RelationshipDeleteArgs<ExtArgs>>): Prisma__RelationshipClient<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Relationship.
     * @param {RelationshipUpdateArgs} args - Arguments to update one Relationship.
     * @example
     * // Update one Relationship
     * const relationship = await prisma.relationship.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RelationshipUpdateArgs>(args: SelectSubset<T, RelationshipUpdateArgs<ExtArgs>>): Prisma__RelationshipClient<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Relationships.
     * @param {RelationshipDeleteManyArgs} args - Arguments to filter Relationships to delete.
     * @example
     * // Delete a few Relationships
     * const { count } = await prisma.relationship.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RelationshipDeleteManyArgs>(args?: SelectSubset<T, RelationshipDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Relationships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Relationships
     * const relationship = await prisma.relationship.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RelationshipUpdateManyArgs>(args: SelectSubset<T, RelationshipUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Relationships and returns the data updated in the database.
     * @param {RelationshipUpdateManyAndReturnArgs} args - Arguments to update many Relationships.
     * @example
     * // Update many Relationships
     * const relationship = await prisma.relationship.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Relationships and only return the `id`
     * const relationshipWithIdOnly = await prisma.relationship.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RelationshipUpdateManyAndReturnArgs>(args: SelectSubset<T, RelationshipUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Relationship.
     * @param {RelationshipUpsertArgs} args - Arguments to update or create a Relationship.
     * @example
     * // Update or create a Relationship
     * const relationship = await prisma.relationship.upsert({
     *   create: {
     *     // ... data to create a Relationship
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Relationship we want to update
     *   }
     * })
     */
    upsert<T extends RelationshipUpsertArgs>(args: SelectSubset<T, RelationshipUpsertArgs<ExtArgs>>): Prisma__RelationshipClient<$Result.GetResult<Prisma.$RelationshipPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Relationships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipCountArgs} args - Arguments to filter Relationships to count.
     * @example
     * // Count the number of Relationships
     * const count = await prisma.relationship.count({
     *   where: {
     *     // ... the filter for the Relationships we want to count
     *   }
     * })
    **/
    count<T extends RelationshipCountArgs>(
      args?: Subset<T, RelationshipCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RelationshipCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Relationship.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RelationshipAggregateArgs>(args: Subset<T, RelationshipAggregateArgs>): Prisma.PrismaPromise<GetRelationshipAggregateType<T>>

    /**
     * Group by Relationship.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RelationshipGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RelationshipGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RelationshipGroupByArgs['orderBy'] }
        : { orderBy?: RelationshipGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RelationshipGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRelationshipGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Relationship model
   */
  readonly fields: RelationshipFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Relationship.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RelationshipClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    reels<T extends Relationship$reelsArgs<ExtArgs> = {}>(args?: Subset<T, Relationship$reelsArgs<ExtArgs>>): Prisma__ReelClient<$Result.GetResult<Prisma.$ReelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    wheelTextures<T extends Relationship$wheelTexturesArgs<ExtArgs> = {}>(args?: Subset<T, Relationship$wheelTexturesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WheelTexturePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Relationship model
   */
  interface RelationshipFieldRefs {
    readonly id: FieldRef<"Relationship", 'Int'>
    readonly createdAt: FieldRef<"Relationship", 'DateTime'>
    readonly updatedAt: FieldRef<"Relationship", 'DateTime'>
    readonly name: FieldRef<"Relationship", 'String'>
    readonly relation: FieldRef<"Relationship", 'String'>
    readonly comment: FieldRef<"Relationship", 'String'>
    readonly reelId: FieldRef<"Relationship", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Relationship findUnique
   */
  export type RelationshipFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    /**
     * Filter, which Relationship to fetch.
     */
    where: RelationshipWhereUniqueInput
  }

  /**
   * Relationship findUniqueOrThrow
   */
  export type RelationshipFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    /**
     * Filter, which Relationship to fetch.
     */
    where: RelationshipWhereUniqueInput
  }

  /**
   * Relationship findFirst
   */
  export type RelationshipFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    /**
     * Filter, which Relationship to fetch.
     */
    where?: RelationshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Relationships to fetch.
     */
    orderBy?: RelationshipOrderByWithRelationInput | RelationshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Relationships.
     */
    cursor?: RelationshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Relationships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Relationships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Relationships.
     */
    distinct?: RelationshipScalarFieldEnum | RelationshipScalarFieldEnum[]
  }

  /**
   * Relationship findFirstOrThrow
   */
  export type RelationshipFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    /**
     * Filter, which Relationship to fetch.
     */
    where?: RelationshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Relationships to fetch.
     */
    orderBy?: RelationshipOrderByWithRelationInput | RelationshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Relationships.
     */
    cursor?: RelationshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Relationships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Relationships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Relationships.
     */
    distinct?: RelationshipScalarFieldEnum | RelationshipScalarFieldEnum[]
  }

  /**
   * Relationship findMany
   */
  export type RelationshipFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    /**
     * Filter, which Relationships to fetch.
     */
    where?: RelationshipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Relationships to fetch.
     */
    orderBy?: RelationshipOrderByWithRelationInput | RelationshipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Relationships.
     */
    cursor?: RelationshipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Relationships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Relationships.
     */
    skip?: number
    distinct?: RelationshipScalarFieldEnum | RelationshipScalarFieldEnum[]
  }

  /**
   * Relationship create
   */
  export type RelationshipCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    /**
     * The data needed to create a Relationship.
     */
    data: XOR<RelationshipCreateInput, RelationshipUncheckedCreateInput>
  }

  /**
   * Relationship createMany
   */
  export type RelationshipCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Relationships.
     */
    data: RelationshipCreateManyInput | RelationshipCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Relationship createManyAndReturn
   */
  export type RelationshipCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * The data used to create many Relationships.
     */
    data: RelationshipCreateManyInput | RelationshipCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Relationship update
   */
  export type RelationshipUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    /**
     * The data needed to update a Relationship.
     */
    data: XOR<RelationshipUpdateInput, RelationshipUncheckedUpdateInput>
    /**
     * Choose, which Relationship to update.
     */
    where: RelationshipWhereUniqueInput
  }

  /**
   * Relationship updateMany
   */
  export type RelationshipUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Relationships.
     */
    data: XOR<RelationshipUpdateManyMutationInput, RelationshipUncheckedUpdateManyInput>
    /**
     * Filter which Relationships to update
     */
    where?: RelationshipWhereInput
    /**
     * Limit how many Relationships to update.
     */
    limit?: number
  }

  /**
   * Relationship updateManyAndReturn
   */
  export type RelationshipUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * The data used to update Relationships.
     */
    data: XOR<RelationshipUpdateManyMutationInput, RelationshipUncheckedUpdateManyInput>
    /**
     * Filter which Relationships to update
     */
    where?: RelationshipWhereInput
    /**
     * Limit how many Relationships to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Relationship upsert
   */
  export type RelationshipUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    /**
     * The filter to search for the Relationship to update in case it exists.
     */
    where: RelationshipWhereUniqueInput
    /**
     * In case the Relationship found by the `where` argument doesn't exist, create a new Relationship with this data.
     */
    create: XOR<RelationshipCreateInput, RelationshipUncheckedCreateInput>
    /**
     * In case the Relationship was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RelationshipUpdateInput, RelationshipUncheckedUpdateInput>
  }

  /**
   * Relationship delete
   */
  export type RelationshipDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
    /**
     * Filter which Relationship to delete.
     */
    where: RelationshipWhereUniqueInput
  }

  /**
   * Relationship deleteMany
   */
  export type RelationshipDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Relationships to delete
     */
    where?: RelationshipWhereInput
    /**
     * Limit how many Relationships to delete.
     */
    limit?: number
  }

  /**
   * Relationship.reels
   */
  export type Relationship$reelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reel
     */
    select?: ReelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Reel
     */
    omit?: ReelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReelInclude<ExtArgs> | null
    where?: ReelWhereInput
  }

  /**
   * Relationship.wheelTextures
   */
  export type Relationship$wheelTexturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WheelTexture
     */
    select?: WheelTextureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WheelTexture
     */
    omit?: WheelTextureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WheelTextureInclude<ExtArgs> | null
    where?: WheelTextureWhereInput
    orderBy?: WheelTextureOrderByWithRelationInput | WheelTextureOrderByWithRelationInput[]
    cursor?: WheelTextureWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WheelTextureScalarFieldEnum | WheelTextureScalarFieldEnum[]
  }

  /**
   * Relationship without action
   */
  export type RelationshipDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Relationship
     */
    select?: RelationshipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Relationship
     */
    omit?: RelationshipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RelationshipInclude<ExtArgs> | null
  }


  /**
   * Model Record
   */

  export type AggregateRecord = {
    _count: RecordCountAggregateOutputType | null
    _avg: RecordAvgAggregateOutputType | null
    _sum: RecordSumAggregateOutputType | null
    _min: RecordMinAggregateOutputType | null
    _max: RecordMaxAggregateOutputType | null
  }

  export type RecordAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type RecordSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type RecordMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    identifier: string | null
    coverUrl: string | null
    name: string | null
    subName: string | null
    description: string | null
    bgm: string | null
    color: string | null
    userId: number | null
    userName: string | null
    birthDate: string | null
    displayMode: string | null
  }

  export type RecordMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    identifier: string | null
    coverUrl: string | null
    name: string | null
    subName: string | null
    description: string | null
    bgm: string | null
    color: string | null
    userId: number | null
    userName: string | null
    birthDate: string | null
    displayMode: string | null
  }

  export type RecordCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    identifier: number
    coverUrl: number
    name: number
    subName: number
    description: number
    bgm: number
    color: number
    userId: number
    userName: number
    birthDate: number
    displayMode: number
    _all: number
  }


  export type RecordAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type RecordSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type RecordMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    identifier?: true
    coverUrl?: true
    name?: true
    subName?: true
    description?: true
    bgm?: true
    color?: true
    userId?: true
    userName?: true
    birthDate?: true
    displayMode?: true
  }

  export type RecordMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    identifier?: true
    coverUrl?: true
    name?: true
    subName?: true
    description?: true
    bgm?: true
    color?: true
    userId?: true
    userName?: true
    birthDate?: true
    displayMode?: true
  }

  export type RecordCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    identifier?: true
    coverUrl?: true
    name?: true
    subName?: true
    description?: true
    bgm?: true
    color?: true
    userId?: true
    userName?: true
    birthDate?: true
    displayMode?: true
    _all?: true
  }

  export type RecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Record to aggregate.
     */
    where?: RecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Records to fetch.
     */
    orderBy?: RecordOrderByWithRelationInput | RecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Records from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Records.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Records
    **/
    _count?: true | RecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RecordAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RecordSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecordMaxAggregateInputType
  }

  export type GetRecordAggregateType<T extends RecordAggregateArgs> = {
        [P in keyof T & keyof AggregateRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecord[P]>
      : GetScalarType<T[P], AggregateRecord[P]>
  }




  export type RecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecordWhereInput
    orderBy?: RecordOrderByWithAggregationInput | RecordOrderByWithAggregationInput[]
    by: RecordScalarFieldEnum[] | RecordScalarFieldEnum
    having?: RecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecordCountAggregateInputType | true
    _avg?: RecordAvgAggregateInputType
    _sum?: RecordSumAggregateInputType
    _min?: RecordMinAggregateInputType
    _max?: RecordMaxAggregateInputType
  }

  export type RecordGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    identifier: string
    coverUrl: string | null
    name: string | null
    subName: string | null
    description: string | null
    bgm: string | null
    color: string | null
    userId: number | null
    userName: string | null
    birthDate: string | null
    displayMode: string | null
    _count: RecordCountAggregateOutputType | null
    _avg: RecordAvgAggregateOutputType | null
    _sum: RecordSumAggregateOutputType | null
    _min: RecordMinAggregateOutputType | null
    _max: RecordMaxAggregateOutputType | null
  }

  type GetRecordGroupByPayload<T extends RecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecordGroupByOutputType[P]>
            : GetScalarType<T[P], RecordGroupByOutputType[P]>
        }
      >
    >


  export type RecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    identifier?: boolean
    coverUrl?: boolean
    name?: boolean
    subName?: boolean
    description?: boolean
    bgm?: boolean
    color?: boolean
    userId?: boolean
    userName?: boolean
    birthDate?: boolean
    displayMode?: boolean
    user?: boolean | Record$userArgs<ExtArgs>
    recordItems?: boolean | Record$recordItemsArgs<ExtArgs>
    _count?: boolean | RecordCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["record"]>

  export type RecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    identifier?: boolean
    coverUrl?: boolean
    name?: boolean
    subName?: boolean
    description?: boolean
    bgm?: boolean
    color?: boolean
    userId?: boolean
    userName?: boolean
    birthDate?: boolean
    displayMode?: boolean
    user?: boolean | Record$userArgs<ExtArgs>
  }, ExtArgs["result"]["record"]>

  export type RecordSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    identifier?: boolean
    coverUrl?: boolean
    name?: boolean
    subName?: boolean
    description?: boolean
    bgm?: boolean
    color?: boolean
    userId?: boolean
    userName?: boolean
    birthDate?: boolean
    displayMode?: boolean
    user?: boolean | Record$userArgs<ExtArgs>
  }, ExtArgs["result"]["record"]>

  export type RecordSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    identifier?: boolean
    coverUrl?: boolean
    name?: boolean
    subName?: boolean
    description?: boolean
    bgm?: boolean
    color?: boolean
    userId?: boolean
    userName?: boolean
    birthDate?: boolean
    displayMode?: boolean
  }

  export type RecordOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "identifier" | "coverUrl" | "name" | "subName" | "description" | "bgm" | "color" | "userId" | "userName" | "birthDate" | "displayMode", ExtArgs["result"]["record"]>
  export type RecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Record$userArgs<ExtArgs>
    recordItems?: boolean | Record$recordItemsArgs<ExtArgs>
    _count?: boolean | RecordCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RecordIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Record$userArgs<ExtArgs>
  }
  export type RecordIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Record$userArgs<ExtArgs>
  }

  export type $RecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Record"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
      recordItems: Prisma.$RecordItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      identifier: string
      coverUrl: string | null
      name: string | null
      subName: string | null
      description: string | null
      bgm: string | null
      color: string | null
      userId: number | null
      userName: string | null
      birthDate: string | null
      displayMode: string | null
    }, ExtArgs["result"]["record"]>
    composites: {}
  }

  type RecordGetPayload<S extends boolean | null | undefined | RecordDefaultArgs> = $Result.GetResult<Prisma.$RecordPayload, S>

  type RecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecordCountAggregateInputType | true
    }

  export interface RecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Record'], meta: { name: 'Record' } }
    /**
     * Find zero or one Record that matches the filter.
     * @param {RecordFindUniqueArgs} args - Arguments to find a Record
     * @example
     * // Get one Record
     * const record = await prisma.record.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecordFindUniqueArgs>(args: SelectSubset<T, RecordFindUniqueArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Record that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecordFindUniqueOrThrowArgs} args - Arguments to find a Record
     * @example
     * // Get one Record
     * const record = await prisma.record.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecordFindUniqueOrThrowArgs>(args: SelectSubset<T, RecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Record that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordFindFirstArgs} args - Arguments to find a Record
     * @example
     * // Get one Record
     * const record = await prisma.record.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecordFindFirstArgs>(args?: SelectSubset<T, RecordFindFirstArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Record that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordFindFirstOrThrowArgs} args - Arguments to find a Record
     * @example
     * // Get one Record
     * const record = await prisma.record.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecordFindFirstOrThrowArgs>(args?: SelectSubset<T, RecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Records that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Records
     * const records = await prisma.record.findMany()
     * 
     * // Get first 10 Records
     * const records = await prisma.record.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recordWithIdOnly = await prisma.record.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecordFindManyArgs>(args?: SelectSubset<T, RecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Record.
     * @param {RecordCreateArgs} args - Arguments to create a Record.
     * @example
     * // Create one Record
     * const Record = await prisma.record.create({
     *   data: {
     *     // ... data to create a Record
     *   }
     * })
     * 
     */
    create<T extends RecordCreateArgs>(args: SelectSubset<T, RecordCreateArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Records.
     * @param {RecordCreateManyArgs} args - Arguments to create many Records.
     * @example
     * // Create many Records
     * const record = await prisma.record.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecordCreateManyArgs>(args?: SelectSubset<T, RecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Records and returns the data saved in the database.
     * @param {RecordCreateManyAndReturnArgs} args - Arguments to create many Records.
     * @example
     * // Create many Records
     * const record = await prisma.record.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Records and only return the `id`
     * const recordWithIdOnly = await prisma.record.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecordCreateManyAndReturnArgs>(args?: SelectSubset<T, RecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Record.
     * @param {RecordDeleteArgs} args - Arguments to delete one Record.
     * @example
     * // Delete one Record
     * const Record = await prisma.record.delete({
     *   where: {
     *     // ... filter to delete one Record
     *   }
     * })
     * 
     */
    delete<T extends RecordDeleteArgs>(args: SelectSubset<T, RecordDeleteArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Record.
     * @param {RecordUpdateArgs} args - Arguments to update one Record.
     * @example
     * // Update one Record
     * const record = await prisma.record.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecordUpdateArgs>(args: SelectSubset<T, RecordUpdateArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Records.
     * @param {RecordDeleteManyArgs} args - Arguments to filter Records to delete.
     * @example
     * // Delete a few Records
     * const { count } = await prisma.record.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecordDeleteManyArgs>(args?: SelectSubset<T, RecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Records.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Records
     * const record = await prisma.record.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecordUpdateManyArgs>(args: SelectSubset<T, RecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Records and returns the data updated in the database.
     * @param {RecordUpdateManyAndReturnArgs} args - Arguments to update many Records.
     * @example
     * // Update many Records
     * const record = await prisma.record.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Records and only return the `id`
     * const recordWithIdOnly = await prisma.record.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecordUpdateManyAndReturnArgs>(args: SelectSubset<T, RecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Record.
     * @param {RecordUpsertArgs} args - Arguments to update or create a Record.
     * @example
     * // Update or create a Record
     * const record = await prisma.record.upsert({
     *   create: {
     *     // ... data to create a Record
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Record we want to update
     *   }
     * })
     */
    upsert<T extends RecordUpsertArgs>(args: SelectSubset<T, RecordUpsertArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Records.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordCountArgs} args - Arguments to filter Records to count.
     * @example
     * // Count the number of Records
     * const count = await prisma.record.count({
     *   where: {
     *     // ... the filter for the Records we want to count
     *   }
     * })
    **/
    count<T extends RecordCountArgs>(
      args?: Subset<T, RecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Record.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecordAggregateArgs>(args: Subset<T, RecordAggregateArgs>): Prisma.PrismaPromise<GetRecordAggregateType<T>>

    /**
     * Group by Record.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecordGroupByArgs['orderBy'] }
        : { orderBy?: RecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Record model
   */
  readonly fields: RecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Record.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends Record$userArgs<ExtArgs> = {}>(args?: Subset<T, Record$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    recordItems<T extends Record$recordItemsArgs<ExtArgs> = {}>(args?: Subset<T, Record$recordItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Record model
   */
  interface RecordFieldRefs {
    readonly id: FieldRef<"Record", 'Int'>
    readonly createdAt: FieldRef<"Record", 'DateTime'>
    readonly updatedAt: FieldRef<"Record", 'DateTime'>
    readonly identifier: FieldRef<"Record", 'String'>
    readonly coverUrl: FieldRef<"Record", 'String'>
    readonly name: FieldRef<"Record", 'String'>
    readonly subName: FieldRef<"Record", 'String'>
    readonly description: FieldRef<"Record", 'String'>
    readonly bgm: FieldRef<"Record", 'String'>
    readonly color: FieldRef<"Record", 'String'>
    readonly userId: FieldRef<"Record", 'Int'>
    readonly userName: FieldRef<"Record", 'String'>
    readonly birthDate: FieldRef<"Record", 'String'>
    readonly displayMode: FieldRef<"Record", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Record findUnique
   */
  export type RecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Record to fetch.
     */
    where: RecordWhereUniqueInput
  }

  /**
   * Record findUniqueOrThrow
   */
  export type RecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Record to fetch.
     */
    where: RecordWhereUniqueInput
  }

  /**
   * Record findFirst
   */
  export type RecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Record to fetch.
     */
    where?: RecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Records to fetch.
     */
    orderBy?: RecordOrderByWithRelationInput | RecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Records.
     */
    cursor?: RecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Records from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Records.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Records.
     */
    distinct?: RecordScalarFieldEnum | RecordScalarFieldEnum[]
  }

  /**
   * Record findFirstOrThrow
   */
  export type RecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Record to fetch.
     */
    where?: RecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Records to fetch.
     */
    orderBy?: RecordOrderByWithRelationInput | RecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Records.
     */
    cursor?: RecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Records from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Records.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Records.
     */
    distinct?: RecordScalarFieldEnum | RecordScalarFieldEnum[]
  }

  /**
   * Record findMany
   */
  export type RecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter, which Records to fetch.
     */
    where?: RecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Records to fetch.
     */
    orderBy?: RecordOrderByWithRelationInput | RecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Records.
     */
    cursor?: RecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Records from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Records.
     */
    skip?: number
    distinct?: RecordScalarFieldEnum | RecordScalarFieldEnum[]
  }

  /**
   * Record create
   */
  export type RecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * The data needed to create a Record.
     */
    data: XOR<RecordCreateInput, RecordUncheckedCreateInput>
  }

  /**
   * Record createMany
   */
  export type RecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Records.
     */
    data: RecordCreateManyInput | RecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Record createManyAndReturn
   */
  export type RecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * The data used to create many Records.
     */
    data: RecordCreateManyInput | RecordCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Record update
   */
  export type RecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * The data needed to update a Record.
     */
    data: XOR<RecordUpdateInput, RecordUncheckedUpdateInput>
    /**
     * Choose, which Record to update.
     */
    where: RecordWhereUniqueInput
  }

  /**
   * Record updateMany
   */
  export type RecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Records.
     */
    data: XOR<RecordUpdateManyMutationInput, RecordUncheckedUpdateManyInput>
    /**
     * Filter which Records to update
     */
    where?: RecordWhereInput
    /**
     * Limit how many Records to update.
     */
    limit?: number
  }

  /**
   * Record updateManyAndReturn
   */
  export type RecordUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * The data used to update Records.
     */
    data: XOR<RecordUpdateManyMutationInput, RecordUncheckedUpdateManyInput>
    /**
     * Filter which Records to update
     */
    where?: RecordWhereInput
    /**
     * Limit how many Records to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Record upsert
   */
  export type RecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * The filter to search for the Record to update in case it exists.
     */
    where: RecordWhereUniqueInput
    /**
     * In case the Record found by the `where` argument doesn't exist, create a new Record with this data.
     */
    create: XOR<RecordCreateInput, RecordUncheckedCreateInput>
    /**
     * In case the Record was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecordUpdateInput, RecordUncheckedUpdateInput>
  }

  /**
   * Record delete
   */
  export type RecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
    /**
     * Filter which Record to delete.
     */
    where: RecordWhereUniqueInput
  }

  /**
   * Record deleteMany
   */
  export type RecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Records to delete
     */
    where?: RecordWhereInput
    /**
     * Limit how many Records to delete.
     */
    limit?: number
  }

  /**
   * Record.user
   */
  export type Record$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Record.recordItems
   */
  export type Record$recordItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    where?: RecordItemWhereInput
    orderBy?: RecordItemOrderByWithRelationInput | RecordItemOrderByWithRelationInput[]
    cursor?: RecordItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RecordItemScalarFieldEnum | RecordItemScalarFieldEnum[]
  }

  /**
   * Record without action
   */
  export type RecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Record
     */
    select?: RecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Record
     */
    omit?: RecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordInclude<ExtArgs> | null
  }


  /**
   * Model RecordItem
   */

  export type AggregateRecordItem = {
    _count: RecordItemCountAggregateOutputType | null
    _avg: RecordItemAvgAggregateOutputType | null
    _sum: RecordItemSumAggregateOutputType | null
    _min: RecordItemMinAggregateOutputType | null
    _max: RecordItemMaxAggregateOutputType | null
  }

  export type RecordItemAvgAggregateOutputType = {
    id: number | null
    recordId: number | null
  }

  export type RecordItemSumAggregateOutputType = {
    id: number | null
    recordId: number | null
  }

  export type RecordItemMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    title: string | null
    date: string | null
    location: string | null
    description: string | null
    color: string | null
    isHighlight: boolean | null
    coverUrl: string | null
    recordId: number | null
  }

  export type RecordItemMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    title: string | null
    date: string | null
    location: string | null
    description: string | null
    color: string | null
    isHighlight: boolean | null
    coverUrl: string | null
    recordId: number | null
  }

  export type RecordItemCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    title: number
    date: number
    location: number
    description: number
    color: number
    isHighlight: number
    coverUrl: number
    images: number
    recordId: number
    _all: number
  }


  export type RecordItemAvgAggregateInputType = {
    id?: true
    recordId?: true
  }

  export type RecordItemSumAggregateInputType = {
    id?: true
    recordId?: true
  }

  export type RecordItemMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    date?: true
    location?: true
    description?: true
    color?: true
    isHighlight?: true
    coverUrl?: true
    recordId?: true
  }

  export type RecordItemMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    date?: true
    location?: true
    description?: true
    color?: true
    isHighlight?: true
    coverUrl?: true
    recordId?: true
  }

  export type RecordItemCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    date?: true
    location?: true
    description?: true
    color?: true
    isHighlight?: true
    coverUrl?: true
    images?: true
    recordId?: true
    _all?: true
  }

  export type RecordItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecordItem to aggregate.
     */
    where?: RecordItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecordItems to fetch.
     */
    orderBy?: RecordItemOrderByWithRelationInput | RecordItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecordItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecordItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecordItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RecordItems
    **/
    _count?: true | RecordItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RecordItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RecordItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecordItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecordItemMaxAggregateInputType
  }

  export type GetRecordItemAggregateType<T extends RecordItemAggregateArgs> = {
        [P in keyof T & keyof AggregateRecordItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecordItem[P]>
      : GetScalarType<T[P], AggregateRecordItem[P]>
  }




  export type RecordItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecordItemWhereInput
    orderBy?: RecordItemOrderByWithAggregationInput | RecordItemOrderByWithAggregationInput[]
    by: RecordItemScalarFieldEnum[] | RecordItemScalarFieldEnum
    having?: RecordItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecordItemCountAggregateInputType | true
    _avg?: RecordItemAvgAggregateInputType
    _sum?: RecordItemSumAggregateInputType
    _min?: RecordItemMinAggregateInputType
    _max?: RecordItemMaxAggregateInputType
  }

  export type RecordItemGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    title: string | null
    date: string | null
    location: string | null
    description: string | null
    color: string | null
    isHighlight: boolean
    coverUrl: string | null
    images: string[]
    recordId: number
    _count: RecordItemCountAggregateOutputType | null
    _avg: RecordItemAvgAggregateOutputType | null
    _sum: RecordItemSumAggregateOutputType | null
    _min: RecordItemMinAggregateOutputType | null
    _max: RecordItemMaxAggregateOutputType | null
  }

  type GetRecordItemGroupByPayload<T extends RecordItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecordItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecordItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecordItemGroupByOutputType[P]>
            : GetScalarType<T[P], RecordItemGroupByOutputType[P]>
        }
      >
    >


  export type RecordItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    date?: boolean
    location?: boolean
    description?: boolean
    color?: boolean
    isHighlight?: boolean
    coverUrl?: boolean
    images?: boolean
    recordId?: boolean
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recordItem"]>

  export type RecordItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    date?: boolean
    location?: boolean
    description?: boolean
    color?: boolean
    isHighlight?: boolean
    coverUrl?: boolean
    images?: boolean
    recordId?: boolean
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recordItem"]>

  export type RecordItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    date?: boolean
    location?: boolean
    description?: boolean
    color?: boolean
    isHighlight?: boolean
    coverUrl?: boolean
    images?: boolean
    recordId?: boolean
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recordItem"]>

  export type RecordItemSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    date?: boolean
    location?: boolean
    description?: boolean
    color?: boolean
    isHighlight?: boolean
    coverUrl?: boolean
    images?: boolean
    recordId?: boolean
  }

  export type RecordItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "title" | "date" | "location" | "description" | "color" | "isHighlight" | "coverUrl" | "images" | "recordId", ExtArgs["result"]["recordItem"]>
  export type RecordItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }
  export type RecordItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }
  export type RecordItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    record?: boolean | RecordDefaultArgs<ExtArgs>
  }

  export type $RecordItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RecordItem"
    objects: {
      record: Prisma.$RecordPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      title: string | null
      date: string | null
      location: string | null
      description: string | null
      color: string | null
      isHighlight: boolean
      coverUrl: string | null
      images: string[]
      recordId: number
    }, ExtArgs["result"]["recordItem"]>
    composites: {}
  }

  type RecordItemGetPayload<S extends boolean | null | undefined | RecordItemDefaultArgs> = $Result.GetResult<Prisma.$RecordItemPayload, S>

  type RecordItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecordItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecordItemCountAggregateInputType | true
    }

  export interface RecordItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RecordItem'], meta: { name: 'RecordItem' } }
    /**
     * Find zero or one RecordItem that matches the filter.
     * @param {RecordItemFindUniqueArgs} args - Arguments to find a RecordItem
     * @example
     * // Get one RecordItem
     * const recordItem = await prisma.recordItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecordItemFindUniqueArgs>(args: SelectSubset<T, RecordItemFindUniqueArgs<ExtArgs>>): Prisma__RecordItemClient<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RecordItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecordItemFindUniqueOrThrowArgs} args - Arguments to find a RecordItem
     * @example
     * // Get one RecordItem
     * const recordItem = await prisma.recordItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecordItemFindUniqueOrThrowArgs>(args: SelectSubset<T, RecordItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecordItemClient<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecordItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordItemFindFirstArgs} args - Arguments to find a RecordItem
     * @example
     * // Get one RecordItem
     * const recordItem = await prisma.recordItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecordItemFindFirstArgs>(args?: SelectSubset<T, RecordItemFindFirstArgs<ExtArgs>>): Prisma__RecordItemClient<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecordItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordItemFindFirstOrThrowArgs} args - Arguments to find a RecordItem
     * @example
     * // Get one RecordItem
     * const recordItem = await prisma.recordItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecordItemFindFirstOrThrowArgs>(args?: SelectSubset<T, RecordItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecordItemClient<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RecordItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RecordItems
     * const recordItems = await prisma.recordItem.findMany()
     * 
     * // Get first 10 RecordItems
     * const recordItems = await prisma.recordItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recordItemWithIdOnly = await prisma.recordItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecordItemFindManyArgs>(args?: SelectSubset<T, RecordItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RecordItem.
     * @param {RecordItemCreateArgs} args - Arguments to create a RecordItem.
     * @example
     * // Create one RecordItem
     * const RecordItem = await prisma.recordItem.create({
     *   data: {
     *     // ... data to create a RecordItem
     *   }
     * })
     * 
     */
    create<T extends RecordItemCreateArgs>(args: SelectSubset<T, RecordItemCreateArgs<ExtArgs>>): Prisma__RecordItemClient<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RecordItems.
     * @param {RecordItemCreateManyArgs} args - Arguments to create many RecordItems.
     * @example
     * // Create many RecordItems
     * const recordItem = await prisma.recordItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecordItemCreateManyArgs>(args?: SelectSubset<T, RecordItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RecordItems and returns the data saved in the database.
     * @param {RecordItemCreateManyAndReturnArgs} args - Arguments to create many RecordItems.
     * @example
     * // Create many RecordItems
     * const recordItem = await prisma.recordItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RecordItems and only return the `id`
     * const recordItemWithIdOnly = await prisma.recordItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecordItemCreateManyAndReturnArgs>(args?: SelectSubset<T, RecordItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RecordItem.
     * @param {RecordItemDeleteArgs} args - Arguments to delete one RecordItem.
     * @example
     * // Delete one RecordItem
     * const RecordItem = await prisma.recordItem.delete({
     *   where: {
     *     // ... filter to delete one RecordItem
     *   }
     * })
     * 
     */
    delete<T extends RecordItemDeleteArgs>(args: SelectSubset<T, RecordItemDeleteArgs<ExtArgs>>): Prisma__RecordItemClient<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RecordItem.
     * @param {RecordItemUpdateArgs} args - Arguments to update one RecordItem.
     * @example
     * // Update one RecordItem
     * const recordItem = await prisma.recordItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecordItemUpdateArgs>(args: SelectSubset<T, RecordItemUpdateArgs<ExtArgs>>): Prisma__RecordItemClient<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RecordItems.
     * @param {RecordItemDeleteManyArgs} args - Arguments to filter RecordItems to delete.
     * @example
     * // Delete a few RecordItems
     * const { count } = await prisma.recordItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecordItemDeleteManyArgs>(args?: SelectSubset<T, RecordItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecordItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RecordItems
     * const recordItem = await prisma.recordItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecordItemUpdateManyArgs>(args: SelectSubset<T, RecordItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecordItems and returns the data updated in the database.
     * @param {RecordItemUpdateManyAndReturnArgs} args - Arguments to update many RecordItems.
     * @example
     * // Update many RecordItems
     * const recordItem = await prisma.recordItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RecordItems and only return the `id`
     * const recordItemWithIdOnly = await prisma.recordItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecordItemUpdateManyAndReturnArgs>(args: SelectSubset<T, RecordItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RecordItem.
     * @param {RecordItemUpsertArgs} args - Arguments to update or create a RecordItem.
     * @example
     * // Update or create a RecordItem
     * const recordItem = await prisma.recordItem.upsert({
     *   create: {
     *     // ... data to create a RecordItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RecordItem we want to update
     *   }
     * })
     */
    upsert<T extends RecordItemUpsertArgs>(args: SelectSubset<T, RecordItemUpsertArgs<ExtArgs>>): Prisma__RecordItemClient<$Result.GetResult<Prisma.$RecordItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RecordItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordItemCountArgs} args - Arguments to filter RecordItems to count.
     * @example
     * // Count the number of RecordItems
     * const count = await prisma.recordItem.count({
     *   where: {
     *     // ... the filter for the RecordItems we want to count
     *   }
     * })
    **/
    count<T extends RecordItemCountArgs>(
      args?: Subset<T, RecordItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecordItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RecordItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecordItemAggregateArgs>(args: Subset<T, RecordItemAggregateArgs>): Prisma.PrismaPromise<GetRecordItemAggregateType<T>>

    /**
     * Group by RecordItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecordItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecordItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecordItemGroupByArgs['orderBy'] }
        : { orderBy?: RecordItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecordItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecordItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RecordItem model
   */
  readonly fields: RecordItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RecordItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecordItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    record<T extends RecordDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RecordDefaultArgs<ExtArgs>>): Prisma__RecordClient<$Result.GetResult<Prisma.$RecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RecordItem model
   */
  interface RecordItemFieldRefs {
    readonly id: FieldRef<"RecordItem", 'Int'>
    readonly createdAt: FieldRef<"RecordItem", 'DateTime'>
    readonly updatedAt: FieldRef<"RecordItem", 'DateTime'>
    readonly title: FieldRef<"RecordItem", 'String'>
    readonly date: FieldRef<"RecordItem", 'String'>
    readonly location: FieldRef<"RecordItem", 'String'>
    readonly description: FieldRef<"RecordItem", 'String'>
    readonly color: FieldRef<"RecordItem", 'String'>
    readonly isHighlight: FieldRef<"RecordItem", 'Boolean'>
    readonly coverUrl: FieldRef<"RecordItem", 'String'>
    readonly images: FieldRef<"RecordItem", 'String[]'>
    readonly recordId: FieldRef<"RecordItem", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * RecordItem findUnique
   */
  export type RecordItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    /**
     * Filter, which RecordItem to fetch.
     */
    where: RecordItemWhereUniqueInput
  }

  /**
   * RecordItem findUniqueOrThrow
   */
  export type RecordItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    /**
     * Filter, which RecordItem to fetch.
     */
    where: RecordItemWhereUniqueInput
  }

  /**
   * RecordItem findFirst
   */
  export type RecordItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    /**
     * Filter, which RecordItem to fetch.
     */
    where?: RecordItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecordItems to fetch.
     */
    orderBy?: RecordItemOrderByWithRelationInput | RecordItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecordItems.
     */
    cursor?: RecordItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecordItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecordItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecordItems.
     */
    distinct?: RecordItemScalarFieldEnum | RecordItemScalarFieldEnum[]
  }

  /**
   * RecordItem findFirstOrThrow
   */
  export type RecordItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    /**
     * Filter, which RecordItem to fetch.
     */
    where?: RecordItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecordItems to fetch.
     */
    orderBy?: RecordItemOrderByWithRelationInput | RecordItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecordItems.
     */
    cursor?: RecordItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecordItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecordItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecordItems.
     */
    distinct?: RecordItemScalarFieldEnum | RecordItemScalarFieldEnum[]
  }

  /**
   * RecordItem findMany
   */
  export type RecordItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    /**
     * Filter, which RecordItems to fetch.
     */
    where?: RecordItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecordItems to fetch.
     */
    orderBy?: RecordItemOrderByWithRelationInput | RecordItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RecordItems.
     */
    cursor?: RecordItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecordItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecordItems.
     */
    skip?: number
    distinct?: RecordItemScalarFieldEnum | RecordItemScalarFieldEnum[]
  }

  /**
   * RecordItem create
   */
  export type RecordItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    /**
     * The data needed to create a RecordItem.
     */
    data: XOR<RecordItemCreateInput, RecordItemUncheckedCreateInput>
  }

  /**
   * RecordItem createMany
   */
  export type RecordItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RecordItems.
     */
    data: RecordItemCreateManyInput | RecordItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RecordItem createManyAndReturn
   */
  export type RecordItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * The data used to create many RecordItems.
     */
    data: RecordItemCreateManyInput | RecordItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecordItem update
   */
  export type RecordItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    /**
     * The data needed to update a RecordItem.
     */
    data: XOR<RecordItemUpdateInput, RecordItemUncheckedUpdateInput>
    /**
     * Choose, which RecordItem to update.
     */
    where: RecordItemWhereUniqueInput
  }

  /**
   * RecordItem updateMany
   */
  export type RecordItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RecordItems.
     */
    data: XOR<RecordItemUpdateManyMutationInput, RecordItemUncheckedUpdateManyInput>
    /**
     * Filter which RecordItems to update
     */
    where?: RecordItemWhereInput
    /**
     * Limit how many RecordItems to update.
     */
    limit?: number
  }

  /**
   * RecordItem updateManyAndReturn
   */
  export type RecordItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * The data used to update RecordItems.
     */
    data: XOR<RecordItemUpdateManyMutationInput, RecordItemUncheckedUpdateManyInput>
    /**
     * Filter which RecordItems to update
     */
    where?: RecordItemWhereInput
    /**
     * Limit how many RecordItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RecordItem upsert
   */
  export type RecordItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    /**
     * The filter to search for the RecordItem to update in case it exists.
     */
    where: RecordItemWhereUniqueInput
    /**
     * In case the RecordItem found by the `where` argument doesn't exist, create a new RecordItem with this data.
     */
    create: XOR<RecordItemCreateInput, RecordItemUncheckedCreateInput>
    /**
     * In case the RecordItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecordItemUpdateInput, RecordItemUncheckedUpdateInput>
  }

  /**
   * RecordItem delete
   */
  export type RecordItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
    /**
     * Filter which RecordItem to delete.
     */
    where: RecordItemWhereUniqueInput
  }

  /**
   * RecordItem deleteMany
   */
  export type RecordItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecordItems to delete
     */
    where?: RecordItemWhereInput
    /**
     * Limit how many RecordItems to delete.
     */
    limit?: number
  }

  /**
   * RecordItem without action
   */
  export type RecordItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecordItem
     */
    select?: RecordItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecordItem
     */
    omit?: RecordItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecordItemInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    mobile: 'mobile',
    plan: 'plan',
    birthDate: 'birthDate',
    email: 'email'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ReelScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    identifier: 'identifier',
    name: 'name',
    birthDate: 'birthDate',
    profileImg: 'profileImg',
    birthPlace: 'birthPlace',
    motto: 'motto',
    lifestoryId: 'lifestoryId',
    userId: 'userId'
  };

  export type ReelScalarFieldEnum = (typeof ReelScalarFieldEnum)[keyof typeof ReelScalarFieldEnum]


  export const LifestoryScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    tokenUsage: 'tokenUsage',
    mood: 'mood',
    qaCount: 'qaCount',
    qaList: 'qaList',
    result: 'result',
    reelId: 'reelId'
  };

  export type LifestoryScalarFieldEnum = (typeof LifestoryScalarFieldEnum)[keyof typeof LifestoryScalarFieldEnum]


  export const WheelTextureScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    srcType: 'srcType',
    srcUrl: 'srcUrl',
    memoryId: 'memoryId',
    relationshipId: 'relationshipId',
    caption: 'caption',
    reelId: 'reelId'
  };

  export type WheelTextureScalarFieldEnum = (typeof WheelTextureScalarFieldEnum)[keyof typeof WheelTextureScalarFieldEnum]


  export const MemoryScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    title: 'title',
    subTitle: 'subTitle',
    date: 'date',
    comment: 'comment',
    reelId: 'reelId'
  };

  export type MemoryScalarFieldEnum = (typeof MemoryScalarFieldEnum)[keyof typeof MemoryScalarFieldEnum]


  export const RelationshipScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'name',
    relation: 'relation',
    comment: 'comment',
    reelId: 'reelId'
  };

  export type RelationshipScalarFieldEnum = (typeof RelationshipScalarFieldEnum)[keyof typeof RelationshipScalarFieldEnum]


  export const RecordScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    identifier: 'identifier',
    coverUrl: 'coverUrl',
    name: 'name',
    subName: 'subName',
    description: 'description',
    bgm: 'bgm',
    color: 'color',
    userId: 'userId',
    userName: 'userName',
    birthDate: 'birthDate',
    displayMode: 'displayMode'
  };

  export type RecordScalarFieldEnum = (typeof RecordScalarFieldEnum)[keyof typeof RecordScalarFieldEnum]


  export const RecordItemScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    title: 'title',
    date: 'date',
    location: 'location',
    description: 'description',
    color: 'color',
    isHighlight: 'isHighlight',
    coverUrl: 'coverUrl',
    images: 'images',
    recordId: 'recordId'
  };

  export type RecordItemScalarFieldEnum = (typeof RecordItemScalarFieldEnum)[keyof typeof RecordItemScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    name?: StringFilter<"User"> | string
    mobile?: StringFilter<"User"> | string
    plan?: StringFilter<"User"> | string
    birthDate?: StringFilter<"User"> | string
    email?: StringNullableFilter<"User"> | string | null
    records?: RecordListRelationFilter
    reels?: ReelListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    mobile?: SortOrder
    plan?: SortOrder
    birthDate?: SortOrder
    email?: SortOrderInput | SortOrder
    records?: RecordOrderByRelationAggregateInput
    reels?: ReelOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    mobile?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    plan?: StringFilter<"User"> | string
    birthDate?: StringFilter<"User"> | string
    records?: RecordListRelationFilter
    reels?: ReelListRelationFilter
  }, "id" | "mobile" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    mobile?: SortOrder
    plan?: SortOrder
    birthDate?: SortOrder
    email?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    name?: StringWithAggregatesFilter<"User"> | string
    mobile?: StringWithAggregatesFilter<"User"> | string
    plan?: StringWithAggregatesFilter<"User"> | string
    birthDate?: StringWithAggregatesFilter<"User"> | string
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type ReelWhereInput = {
    AND?: ReelWhereInput | ReelWhereInput[]
    OR?: ReelWhereInput[]
    NOT?: ReelWhereInput | ReelWhereInput[]
    id?: IntFilter<"Reel"> | number
    createdAt?: DateTimeFilter<"Reel"> | Date | string
    updatedAt?: DateTimeFilter<"Reel"> | Date | string
    identifier?: StringFilter<"Reel"> | string
    name?: StringFilter<"Reel"> | string
    birthDate?: StringFilter<"Reel"> | string
    profileImg?: StringNullableFilter<"Reel"> | string | null
    birthPlace?: StringNullableFilter<"Reel"> | string | null
    motto?: StringNullableFilter<"Reel"> | string | null
    lifestoryId?: IntNullableFilter<"Reel"> | number | null
    userId?: IntNullableFilter<"Reel"> | number | null
    lifestory?: XOR<LifestoryNullableScalarRelationFilter, LifestoryWhereInput> | null
    memorys?: MemoryListRelationFilter
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    relationships?: RelationshipListRelationFilter
    childhood?: WheelTextureListRelationFilter
  }

  export type ReelOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    name?: SortOrder
    birthDate?: SortOrder
    profileImg?: SortOrderInput | SortOrder
    birthPlace?: SortOrderInput | SortOrder
    motto?: SortOrderInput | SortOrder
    lifestoryId?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    lifestory?: LifestoryOrderByWithRelationInput
    memorys?: MemoryOrderByRelationAggregateInput
    user?: UserOrderByWithRelationInput
    relationships?: RelationshipOrderByRelationAggregateInput
    childhood?: WheelTextureOrderByRelationAggregateInput
  }

  export type ReelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    identifier?: string
    AND?: ReelWhereInput | ReelWhereInput[]
    OR?: ReelWhereInput[]
    NOT?: ReelWhereInput | ReelWhereInput[]
    createdAt?: DateTimeFilter<"Reel"> | Date | string
    updatedAt?: DateTimeFilter<"Reel"> | Date | string
    name?: StringFilter<"Reel"> | string
    birthDate?: StringFilter<"Reel"> | string
    profileImg?: StringNullableFilter<"Reel"> | string | null
    birthPlace?: StringNullableFilter<"Reel"> | string | null
    motto?: StringNullableFilter<"Reel"> | string | null
    lifestoryId?: IntNullableFilter<"Reel"> | number | null
    userId?: IntNullableFilter<"Reel"> | number | null
    lifestory?: XOR<LifestoryNullableScalarRelationFilter, LifestoryWhereInput> | null
    memorys?: MemoryListRelationFilter
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    relationships?: RelationshipListRelationFilter
    childhood?: WheelTextureListRelationFilter
  }, "id" | "identifier">

  export type ReelOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    name?: SortOrder
    birthDate?: SortOrder
    profileImg?: SortOrderInput | SortOrder
    birthPlace?: SortOrderInput | SortOrder
    motto?: SortOrderInput | SortOrder
    lifestoryId?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    _count?: ReelCountOrderByAggregateInput
    _avg?: ReelAvgOrderByAggregateInput
    _max?: ReelMaxOrderByAggregateInput
    _min?: ReelMinOrderByAggregateInput
    _sum?: ReelSumOrderByAggregateInput
  }

  export type ReelScalarWhereWithAggregatesInput = {
    AND?: ReelScalarWhereWithAggregatesInput | ReelScalarWhereWithAggregatesInput[]
    OR?: ReelScalarWhereWithAggregatesInput[]
    NOT?: ReelScalarWhereWithAggregatesInput | ReelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Reel"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Reel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Reel"> | Date | string
    identifier?: StringWithAggregatesFilter<"Reel"> | string
    name?: StringWithAggregatesFilter<"Reel"> | string
    birthDate?: StringWithAggregatesFilter<"Reel"> | string
    profileImg?: StringNullableWithAggregatesFilter<"Reel"> | string | null
    birthPlace?: StringNullableWithAggregatesFilter<"Reel"> | string | null
    motto?: StringNullableWithAggregatesFilter<"Reel"> | string | null
    lifestoryId?: IntNullableWithAggregatesFilter<"Reel"> | number | null
    userId?: IntNullableWithAggregatesFilter<"Reel"> | number | null
  }

  export type LifestoryWhereInput = {
    AND?: LifestoryWhereInput | LifestoryWhereInput[]
    OR?: LifestoryWhereInput[]
    NOT?: LifestoryWhereInput | LifestoryWhereInput[]
    id?: IntFilter<"Lifestory"> | number
    createdAt?: DateTimeFilter<"Lifestory"> | Date | string
    updatedAt?: DateTimeFilter<"Lifestory"> | Date | string
    tokenUsage?: IntFilter<"Lifestory"> | number
    mood?: StringNullableFilter<"Lifestory"> | string | null
    qaCount?: IntNullableFilter<"Lifestory"> | number | null
    qaList?: JsonNullableFilter<"Lifestory">
    result?: StringNullableFilter<"Lifestory"> | string | null
    reelId?: IntFilter<"Lifestory"> | number
    reel?: XOR<ReelScalarRelationFilter, ReelWhereInput>
  }

  export type LifestoryOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tokenUsage?: SortOrder
    mood?: SortOrderInput | SortOrder
    qaCount?: SortOrderInput | SortOrder
    qaList?: SortOrderInput | SortOrder
    result?: SortOrderInput | SortOrder
    reelId?: SortOrder
    reel?: ReelOrderByWithRelationInput
  }

  export type LifestoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    reelId?: number
    AND?: LifestoryWhereInput | LifestoryWhereInput[]
    OR?: LifestoryWhereInput[]
    NOT?: LifestoryWhereInput | LifestoryWhereInput[]
    createdAt?: DateTimeFilter<"Lifestory"> | Date | string
    updatedAt?: DateTimeFilter<"Lifestory"> | Date | string
    tokenUsage?: IntFilter<"Lifestory"> | number
    mood?: StringNullableFilter<"Lifestory"> | string | null
    qaCount?: IntNullableFilter<"Lifestory"> | number | null
    qaList?: JsonNullableFilter<"Lifestory">
    result?: StringNullableFilter<"Lifestory"> | string | null
    reel?: XOR<ReelScalarRelationFilter, ReelWhereInput>
  }, "id" | "reelId">

  export type LifestoryOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tokenUsage?: SortOrder
    mood?: SortOrderInput | SortOrder
    qaCount?: SortOrderInput | SortOrder
    qaList?: SortOrderInput | SortOrder
    result?: SortOrderInput | SortOrder
    reelId?: SortOrder
    _count?: LifestoryCountOrderByAggregateInput
    _avg?: LifestoryAvgOrderByAggregateInput
    _max?: LifestoryMaxOrderByAggregateInput
    _min?: LifestoryMinOrderByAggregateInput
    _sum?: LifestorySumOrderByAggregateInput
  }

  export type LifestoryScalarWhereWithAggregatesInput = {
    AND?: LifestoryScalarWhereWithAggregatesInput | LifestoryScalarWhereWithAggregatesInput[]
    OR?: LifestoryScalarWhereWithAggregatesInput[]
    NOT?: LifestoryScalarWhereWithAggregatesInput | LifestoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Lifestory"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Lifestory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Lifestory"> | Date | string
    tokenUsage?: IntWithAggregatesFilter<"Lifestory"> | number
    mood?: StringNullableWithAggregatesFilter<"Lifestory"> | string | null
    qaCount?: IntNullableWithAggregatesFilter<"Lifestory"> | number | null
    qaList?: JsonNullableWithAggregatesFilter<"Lifestory">
    result?: StringNullableWithAggregatesFilter<"Lifestory"> | string | null
    reelId?: IntWithAggregatesFilter<"Lifestory"> | number
  }

  export type WheelTextureWhereInput = {
    AND?: WheelTextureWhereInput | WheelTextureWhereInput[]
    OR?: WheelTextureWhereInput[]
    NOT?: WheelTextureWhereInput | WheelTextureWhereInput[]
    id?: IntFilter<"WheelTexture"> | number
    createdAt?: DateTimeFilter<"WheelTexture"> | Date | string
    updatedAt?: DateTimeFilter<"WheelTexture"> | Date | string
    srcType?: IntFilter<"WheelTexture"> | number
    srcUrl?: StringFilter<"WheelTexture"> | string
    memoryId?: IntNullableFilter<"WheelTexture"> | number | null
    relationshipId?: IntNullableFilter<"WheelTexture"> | number | null
    caption?: StringNullableFilter<"WheelTexture"> | string | null
    reelId?: IntNullableFilter<"WheelTexture"> | number | null
    memory?: XOR<MemoryNullableScalarRelationFilter, MemoryWhereInput> | null
    reels?: XOR<ReelNullableScalarRelationFilter, ReelWhereInput> | null
    relationship?: XOR<RelationshipNullableScalarRelationFilter, RelationshipWhereInput> | null
  }

  export type WheelTextureOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    srcType?: SortOrder
    srcUrl?: SortOrder
    memoryId?: SortOrderInput | SortOrder
    relationshipId?: SortOrderInput | SortOrder
    caption?: SortOrderInput | SortOrder
    reelId?: SortOrderInput | SortOrder
    memory?: MemoryOrderByWithRelationInput
    reels?: ReelOrderByWithRelationInput
    relationship?: RelationshipOrderByWithRelationInput
  }

  export type WheelTextureWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: WheelTextureWhereInput | WheelTextureWhereInput[]
    OR?: WheelTextureWhereInput[]
    NOT?: WheelTextureWhereInput | WheelTextureWhereInput[]
    createdAt?: DateTimeFilter<"WheelTexture"> | Date | string
    updatedAt?: DateTimeFilter<"WheelTexture"> | Date | string
    srcType?: IntFilter<"WheelTexture"> | number
    srcUrl?: StringFilter<"WheelTexture"> | string
    memoryId?: IntNullableFilter<"WheelTexture"> | number | null
    relationshipId?: IntNullableFilter<"WheelTexture"> | number | null
    caption?: StringNullableFilter<"WheelTexture"> | string | null
    reelId?: IntNullableFilter<"WheelTexture"> | number | null
    memory?: XOR<MemoryNullableScalarRelationFilter, MemoryWhereInput> | null
    reels?: XOR<ReelNullableScalarRelationFilter, ReelWhereInput> | null
    relationship?: XOR<RelationshipNullableScalarRelationFilter, RelationshipWhereInput> | null
  }, "id">

  export type WheelTextureOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    srcType?: SortOrder
    srcUrl?: SortOrder
    memoryId?: SortOrderInput | SortOrder
    relationshipId?: SortOrderInput | SortOrder
    caption?: SortOrderInput | SortOrder
    reelId?: SortOrderInput | SortOrder
    _count?: WheelTextureCountOrderByAggregateInput
    _avg?: WheelTextureAvgOrderByAggregateInput
    _max?: WheelTextureMaxOrderByAggregateInput
    _min?: WheelTextureMinOrderByAggregateInput
    _sum?: WheelTextureSumOrderByAggregateInput
  }

  export type WheelTextureScalarWhereWithAggregatesInput = {
    AND?: WheelTextureScalarWhereWithAggregatesInput | WheelTextureScalarWhereWithAggregatesInput[]
    OR?: WheelTextureScalarWhereWithAggregatesInput[]
    NOT?: WheelTextureScalarWhereWithAggregatesInput | WheelTextureScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"WheelTexture"> | number
    createdAt?: DateTimeWithAggregatesFilter<"WheelTexture"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WheelTexture"> | Date | string
    srcType?: IntWithAggregatesFilter<"WheelTexture"> | number
    srcUrl?: StringWithAggregatesFilter<"WheelTexture"> | string
    memoryId?: IntNullableWithAggregatesFilter<"WheelTexture"> | number | null
    relationshipId?: IntNullableWithAggregatesFilter<"WheelTexture"> | number | null
    caption?: StringNullableWithAggregatesFilter<"WheelTexture"> | string | null
    reelId?: IntNullableWithAggregatesFilter<"WheelTexture"> | number | null
  }

  export type MemoryWhereInput = {
    AND?: MemoryWhereInput | MemoryWhereInput[]
    OR?: MemoryWhereInput[]
    NOT?: MemoryWhereInput | MemoryWhereInput[]
    id?: IntFilter<"Memory"> | number
    createdAt?: DateTimeFilter<"Memory"> | Date | string
    updatedAt?: DateTimeFilter<"Memory"> | Date | string
    title?: StringFilter<"Memory"> | string
    subTitle?: StringNullableFilter<"Memory"> | string | null
    date?: DateTimeNullableFilter<"Memory"> | Date | string | null
    comment?: StringNullableFilter<"Memory"> | string | null
    reelId?: IntFilter<"Memory"> | number
    reel?: XOR<ReelScalarRelationFilter, ReelWhereInput>
    wheelTextures?: WheelTextureListRelationFilter
  }

  export type MemoryOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    subTitle?: SortOrderInput | SortOrder
    date?: SortOrderInput | SortOrder
    comment?: SortOrderInput | SortOrder
    reelId?: SortOrder
    reel?: ReelOrderByWithRelationInput
    wheelTextures?: WheelTextureOrderByRelationAggregateInput
  }

  export type MemoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: MemoryWhereInput | MemoryWhereInput[]
    OR?: MemoryWhereInput[]
    NOT?: MemoryWhereInput | MemoryWhereInput[]
    createdAt?: DateTimeFilter<"Memory"> | Date | string
    updatedAt?: DateTimeFilter<"Memory"> | Date | string
    title?: StringFilter<"Memory"> | string
    subTitle?: StringNullableFilter<"Memory"> | string | null
    date?: DateTimeNullableFilter<"Memory"> | Date | string | null
    comment?: StringNullableFilter<"Memory"> | string | null
    reelId?: IntFilter<"Memory"> | number
    reel?: XOR<ReelScalarRelationFilter, ReelWhereInput>
    wheelTextures?: WheelTextureListRelationFilter
  }, "id">

  export type MemoryOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    subTitle?: SortOrderInput | SortOrder
    date?: SortOrderInput | SortOrder
    comment?: SortOrderInput | SortOrder
    reelId?: SortOrder
    _count?: MemoryCountOrderByAggregateInput
    _avg?: MemoryAvgOrderByAggregateInput
    _max?: MemoryMaxOrderByAggregateInput
    _min?: MemoryMinOrderByAggregateInput
    _sum?: MemorySumOrderByAggregateInput
  }

  export type MemoryScalarWhereWithAggregatesInput = {
    AND?: MemoryScalarWhereWithAggregatesInput | MemoryScalarWhereWithAggregatesInput[]
    OR?: MemoryScalarWhereWithAggregatesInput[]
    NOT?: MemoryScalarWhereWithAggregatesInput | MemoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Memory"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Memory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Memory"> | Date | string
    title?: StringWithAggregatesFilter<"Memory"> | string
    subTitle?: StringNullableWithAggregatesFilter<"Memory"> | string | null
    date?: DateTimeNullableWithAggregatesFilter<"Memory"> | Date | string | null
    comment?: StringNullableWithAggregatesFilter<"Memory"> | string | null
    reelId?: IntWithAggregatesFilter<"Memory"> | number
  }

  export type RelationshipWhereInput = {
    AND?: RelationshipWhereInput | RelationshipWhereInput[]
    OR?: RelationshipWhereInput[]
    NOT?: RelationshipWhereInput | RelationshipWhereInput[]
    id?: IntFilter<"Relationship"> | number
    createdAt?: DateTimeFilter<"Relationship"> | Date | string
    updatedAt?: DateTimeFilter<"Relationship"> | Date | string
    name?: StringFilter<"Relationship"> | string
    relation?: StringFilter<"Relationship"> | string
    comment?: StringNullableFilter<"Relationship"> | string | null
    reelId?: IntNullableFilter<"Relationship"> | number | null
    reels?: XOR<ReelNullableScalarRelationFilter, ReelWhereInput> | null
    wheelTextures?: WheelTextureListRelationFilter
  }

  export type RelationshipOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    relation?: SortOrder
    comment?: SortOrderInput | SortOrder
    reelId?: SortOrderInput | SortOrder
    reels?: ReelOrderByWithRelationInput
    wheelTextures?: WheelTextureOrderByRelationAggregateInput
  }

  export type RelationshipWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: RelationshipWhereInput | RelationshipWhereInput[]
    OR?: RelationshipWhereInput[]
    NOT?: RelationshipWhereInput | RelationshipWhereInput[]
    createdAt?: DateTimeFilter<"Relationship"> | Date | string
    updatedAt?: DateTimeFilter<"Relationship"> | Date | string
    name?: StringFilter<"Relationship"> | string
    relation?: StringFilter<"Relationship"> | string
    comment?: StringNullableFilter<"Relationship"> | string | null
    reelId?: IntNullableFilter<"Relationship"> | number | null
    reels?: XOR<ReelNullableScalarRelationFilter, ReelWhereInput> | null
    wheelTextures?: WheelTextureListRelationFilter
  }, "id">

  export type RelationshipOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    relation?: SortOrder
    comment?: SortOrderInput | SortOrder
    reelId?: SortOrderInput | SortOrder
    _count?: RelationshipCountOrderByAggregateInput
    _avg?: RelationshipAvgOrderByAggregateInput
    _max?: RelationshipMaxOrderByAggregateInput
    _min?: RelationshipMinOrderByAggregateInput
    _sum?: RelationshipSumOrderByAggregateInput
  }

  export type RelationshipScalarWhereWithAggregatesInput = {
    AND?: RelationshipScalarWhereWithAggregatesInput | RelationshipScalarWhereWithAggregatesInput[]
    OR?: RelationshipScalarWhereWithAggregatesInput[]
    NOT?: RelationshipScalarWhereWithAggregatesInput | RelationshipScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Relationship"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Relationship"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Relationship"> | Date | string
    name?: StringWithAggregatesFilter<"Relationship"> | string
    relation?: StringWithAggregatesFilter<"Relationship"> | string
    comment?: StringNullableWithAggregatesFilter<"Relationship"> | string | null
    reelId?: IntNullableWithAggregatesFilter<"Relationship"> | number | null
  }

  export type RecordWhereInput = {
    AND?: RecordWhereInput | RecordWhereInput[]
    OR?: RecordWhereInput[]
    NOT?: RecordWhereInput | RecordWhereInput[]
    id?: IntFilter<"Record"> | number
    createdAt?: DateTimeFilter<"Record"> | Date | string
    updatedAt?: DateTimeFilter<"Record"> | Date | string
    identifier?: StringFilter<"Record"> | string
    coverUrl?: StringNullableFilter<"Record"> | string | null
    name?: StringNullableFilter<"Record"> | string | null
    subName?: StringNullableFilter<"Record"> | string | null
    description?: StringNullableFilter<"Record"> | string | null
    bgm?: StringNullableFilter<"Record"> | string | null
    color?: StringNullableFilter<"Record"> | string | null
    userId?: IntNullableFilter<"Record"> | number | null
    userName?: StringNullableFilter<"Record"> | string | null
    birthDate?: StringNullableFilter<"Record"> | string | null
    displayMode?: StringNullableFilter<"Record"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    recordItems?: RecordItemListRelationFilter
  }

  export type RecordOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    coverUrl?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    subName?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    bgm?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    userName?: SortOrderInput | SortOrder
    birthDate?: SortOrderInput | SortOrder
    displayMode?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    recordItems?: RecordItemOrderByRelationAggregateInput
  }

  export type RecordWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    identifier?: string
    AND?: RecordWhereInput | RecordWhereInput[]
    OR?: RecordWhereInput[]
    NOT?: RecordWhereInput | RecordWhereInput[]
    createdAt?: DateTimeFilter<"Record"> | Date | string
    updatedAt?: DateTimeFilter<"Record"> | Date | string
    coverUrl?: StringNullableFilter<"Record"> | string | null
    name?: StringNullableFilter<"Record"> | string | null
    subName?: StringNullableFilter<"Record"> | string | null
    description?: StringNullableFilter<"Record"> | string | null
    bgm?: StringNullableFilter<"Record"> | string | null
    color?: StringNullableFilter<"Record"> | string | null
    userId?: IntNullableFilter<"Record"> | number | null
    userName?: StringNullableFilter<"Record"> | string | null
    birthDate?: StringNullableFilter<"Record"> | string | null
    displayMode?: StringNullableFilter<"Record"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    recordItems?: RecordItemListRelationFilter
  }, "id" | "identifier">

  export type RecordOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    coverUrl?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    subName?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    bgm?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    userName?: SortOrderInput | SortOrder
    birthDate?: SortOrderInput | SortOrder
    displayMode?: SortOrderInput | SortOrder
    _count?: RecordCountOrderByAggregateInput
    _avg?: RecordAvgOrderByAggregateInput
    _max?: RecordMaxOrderByAggregateInput
    _min?: RecordMinOrderByAggregateInput
    _sum?: RecordSumOrderByAggregateInput
  }

  export type RecordScalarWhereWithAggregatesInput = {
    AND?: RecordScalarWhereWithAggregatesInput | RecordScalarWhereWithAggregatesInput[]
    OR?: RecordScalarWhereWithAggregatesInput[]
    NOT?: RecordScalarWhereWithAggregatesInput | RecordScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Record"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Record"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Record"> | Date | string
    identifier?: StringWithAggregatesFilter<"Record"> | string
    coverUrl?: StringNullableWithAggregatesFilter<"Record"> | string | null
    name?: StringNullableWithAggregatesFilter<"Record"> | string | null
    subName?: StringNullableWithAggregatesFilter<"Record"> | string | null
    description?: StringNullableWithAggregatesFilter<"Record"> | string | null
    bgm?: StringNullableWithAggregatesFilter<"Record"> | string | null
    color?: StringNullableWithAggregatesFilter<"Record"> | string | null
    userId?: IntNullableWithAggregatesFilter<"Record"> | number | null
    userName?: StringNullableWithAggregatesFilter<"Record"> | string | null
    birthDate?: StringNullableWithAggregatesFilter<"Record"> | string | null
    displayMode?: StringNullableWithAggregatesFilter<"Record"> | string | null
  }

  export type RecordItemWhereInput = {
    AND?: RecordItemWhereInput | RecordItemWhereInput[]
    OR?: RecordItemWhereInput[]
    NOT?: RecordItemWhereInput | RecordItemWhereInput[]
    id?: IntFilter<"RecordItem"> | number
    createdAt?: DateTimeFilter<"RecordItem"> | Date | string
    updatedAt?: DateTimeFilter<"RecordItem"> | Date | string
    title?: StringNullableFilter<"RecordItem"> | string | null
    date?: StringNullableFilter<"RecordItem"> | string | null
    location?: StringNullableFilter<"RecordItem"> | string | null
    description?: StringNullableFilter<"RecordItem"> | string | null
    color?: StringNullableFilter<"RecordItem"> | string | null
    isHighlight?: BoolFilter<"RecordItem"> | boolean
    coverUrl?: StringNullableFilter<"RecordItem"> | string | null
    images?: StringNullableListFilter<"RecordItem">
    recordId?: IntFilter<"RecordItem"> | number
    record?: XOR<RecordScalarRelationFilter, RecordWhereInput>
  }

  export type RecordItemOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrderInput | SortOrder
    date?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    isHighlight?: SortOrder
    coverUrl?: SortOrderInput | SortOrder
    images?: SortOrder
    recordId?: SortOrder
    record?: RecordOrderByWithRelationInput
  }

  export type RecordItemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: RecordItemWhereInput | RecordItemWhereInput[]
    OR?: RecordItemWhereInput[]
    NOT?: RecordItemWhereInput | RecordItemWhereInput[]
    createdAt?: DateTimeFilter<"RecordItem"> | Date | string
    updatedAt?: DateTimeFilter<"RecordItem"> | Date | string
    title?: StringNullableFilter<"RecordItem"> | string | null
    date?: StringNullableFilter<"RecordItem"> | string | null
    location?: StringNullableFilter<"RecordItem"> | string | null
    description?: StringNullableFilter<"RecordItem"> | string | null
    color?: StringNullableFilter<"RecordItem"> | string | null
    isHighlight?: BoolFilter<"RecordItem"> | boolean
    coverUrl?: StringNullableFilter<"RecordItem"> | string | null
    images?: StringNullableListFilter<"RecordItem">
    recordId?: IntFilter<"RecordItem"> | number
    record?: XOR<RecordScalarRelationFilter, RecordWhereInput>
  }, "id">

  export type RecordItemOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrderInput | SortOrder
    date?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    isHighlight?: SortOrder
    coverUrl?: SortOrderInput | SortOrder
    images?: SortOrder
    recordId?: SortOrder
    _count?: RecordItemCountOrderByAggregateInput
    _avg?: RecordItemAvgOrderByAggregateInput
    _max?: RecordItemMaxOrderByAggregateInput
    _min?: RecordItemMinOrderByAggregateInput
    _sum?: RecordItemSumOrderByAggregateInput
  }

  export type RecordItemScalarWhereWithAggregatesInput = {
    AND?: RecordItemScalarWhereWithAggregatesInput | RecordItemScalarWhereWithAggregatesInput[]
    OR?: RecordItemScalarWhereWithAggregatesInput[]
    NOT?: RecordItemScalarWhereWithAggregatesInput | RecordItemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"RecordItem"> | number
    createdAt?: DateTimeWithAggregatesFilter<"RecordItem"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RecordItem"> | Date | string
    title?: StringNullableWithAggregatesFilter<"RecordItem"> | string | null
    date?: StringNullableWithAggregatesFilter<"RecordItem"> | string | null
    location?: StringNullableWithAggregatesFilter<"RecordItem"> | string | null
    description?: StringNullableWithAggregatesFilter<"RecordItem"> | string | null
    color?: StringNullableWithAggregatesFilter<"RecordItem"> | string | null
    isHighlight?: BoolWithAggregatesFilter<"RecordItem"> | boolean
    coverUrl?: StringNullableWithAggregatesFilter<"RecordItem"> | string | null
    images?: StringNullableListFilter<"RecordItem">
    recordId?: IntWithAggregatesFilter<"RecordItem"> | number
  }

  export type UserCreateInput = {
    name: string
    mobile: string
    plan?: string
    birthDate: string
    email?: string | null
    records?: RecordCreateNestedManyWithoutUserInput
    reels?: ReelCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    name: string
    mobile: string
    plan?: string
    birthDate: string
    email?: string | null
    records?: RecordUncheckedCreateNestedManyWithoutUserInput
    reels?: ReelUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    records?: RecordUpdateManyWithoutUserNestedInput
    reels?: ReelUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    records?: RecordUncheckedUpdateManyWithoutUserNestedInput
    reels?: ReelUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    name: string
    mobile: string
    plan?: string
    birthDate: string
    email?: string | null
  }

  export type UserUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReelCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    lifestory?: LifestoryCreateNestedOneWithoutReelInput
    memorys?: MemoryCreateNestedManyWithoutReelInput
    user?: UserCreateNestedOneWithoutReelsInput
    relationships?: RelationshipCreateNestedManyWithoutReelsInput
    childhood?: WheelTextureCreateNestedManyWithoutReelsInput
  }

  export type ReelUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    userId?: number | null
    lifestory?: LifestoryUncheckedCreateNestedOneWithoutReelInput
    memorys?: MemoryUncheckedCreateNestedManyWithoutReelInput
    relationships?: RelationshipUncheckedCreateNestedManyWithoutReelsInput
    childhood?: WheelTextureUncheckedCreateNestedManyWithoutReelsInput
  }

  export type ReelUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUpdateOneWithoutReelNestedInput
    memorys?: MemoryUpdateManyWithoutReelNestedInput
    user?: UserUpdateOneWithoutReelsNestedInput
    relationships?: RelationshipUpdateManyWithoutReelsNestedInput
    childhood?: WheelTextureUpdateManyWithoutReelsNestedInput
  }

  export type ReelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUncheckedUpdateOneWithoutReelNestedInput
    memorys?: MemoryUncheckedUpdateManyWithoutReelNestedInput
    relationships?: RelationshipUncheckedUpdateManyWithoutReelsNestedInput
    childhood?: WheelTextureUncheckedUpdateManyWithoutReelsNestedInput
  }

  export type ReelCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    userId?: number | null
  }

  export type ReelUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ReelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type LifestoryCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    tokenUsage?: number
    mood?: string | null
    qaCount?: number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: string | null
    reel: ReelCreateNestedOneWithoutLifestoryInput
  }

  export type LifestoryUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tokenUsage?: number
    mood?: string | null
    qaCount?: number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: string | null
    reelId: number
  }

  export type LifestoryUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tokenUsage?: IntFieldUpdateOperationsInput | number
    mood?: NullableStringFieldUpdateOperationsInput | string | null
    qaCount?: NullableIntFieldUpdateOperationsInput | number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: NullableStringFieldUpdateOperationsInput | string | null
    reel?: ReelUpdateOneRequiredWithoutLifestoryNestedInput
  }

  export type LifestoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tokenUsage?: IntFieldUpdateOperationsInput | number
    mood?: NullableStringFieldUpdateOperationsInput | string | null
    qaCount?: NullableIntFieldUpdateOperationsInput | number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: IntFieldUpdateOperationsInput | number
  }

  export type LifestoryCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tokenUsage?: number
    mood?: string | null
    qaCount?: number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: string | null
    reelId: number
  }

  export type LifestoryUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tokenUsage?: IntFieldUpdateOperationsInput | number
    mood?: NullableStringFieldUpdateOperationsInput | string | null
    qaCount?: NullableIntFieldUpdateOperationsInput | number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LifestoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tokenUsage?: IntFieldUpdateOperationsInput | number
    mood?: NullableStringFieldUpdateOperationsInput | string | null
    qaCount?: NullableIntFieldUpdateOperationsInput | number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: IntFieldUpdateOperationsInput | number
  }

  export type WheelTextureCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    caption?: string | null
    memory?: MemoryCreateNestedOneWithoutWheelTexturesInput
    reels?: ReelCreateNestedOneWithoutChildhoodInput
    relationship?: RelationshipCreateNestedOneWithoutWheelTexturesInput
  }

  export type WheelTextureUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    memoryId?: number | null
    relationshipId?: number | null
    caption?: string | null
    reelId?: number | null
  }

  export type WheelTextureUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    memory?: MemoryUpdateOneWithoutWheelTexturesNestedInput
    reels?: ReelUpdateOneWithoutChildhoodNestedInput
    relationship?: RelationshipUpdateOneWithoutWheelTexturesNestedInput
  }

  export type WheelTextureUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    memoryId?: NullableIntFieldUpdateOperationsInput | number | null
    relationshipId?: NullableIntFieldUpdateOperationsInput | number | null
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type WheelTextureCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    memoryId?: number | null
    relationshipId?: number | null
    caption?: string | null
    reelId?: number | null
  }

  export type WheelTextureUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WheelTextureUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    memoryId?: NullableIntFieldUpdateOperationsInput | number | null
    relationshipId?: NullableIntFieldUpdateOperationsInput | number | null
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type MemoryCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    subTitle?: string | null
    date?: Date | string | null
    comment?: string | null
    reel: ReelCreateNestedOneWithoutMemorysInput
    wheelTextures?: WheelTextureCreateNestedManyWithoutMemoryInput
  }

  export type MemoryUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    subTitle?: string | null
    date?: Date | string | null
    comment?: string | null
    reelId: number
    wheelTextures?: WheelTextureUncheckedCreateNestedManyWithoutMemoryInput
  }

  export type MemoryUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    subTitle?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reel?: ReelUpdateOneRequiredWithoutMemorysNestedInput
    wheelTextures?: WheelTextureUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    subTitle?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: IntFieldUpdateOperationsInput | number
    wheelTextures?: WheelTextureUncheckedUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    subTitle?: string | null
    date?: Date | string | null
    comment?: string | null
    reelId: number
  }

  export type MemoryUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    subTitle?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MemoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    subTitle?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: IntFieldUpdateOperationsInput | number
  }

  export type RelationshipCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    relation: string
    comment?: string | null
    reels?: ReelCreateNestedOneWithoutRelationshipsInput
    wheelTextures?: WheelTextureCreateNestedManyWithoutRelationshipInput
  }

  export type RelationshipUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    relation: string
    comment?: string | null
    reelId?: number | null
    wheelTextures?: WheelTextureUncheckedCreateNestedManyWithoutRelationshipInput
  }

  export type RelationshipUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reels?: ReelUpdateOneWithoutRelationshipsNestedInput
    wheelTextures?: WheelTextureUpdateManyWithoutRelationshipNestedInput
  }

  export type RelationshipUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: NullableIntFieldUpdateOperationsInput | number | null
    wheelTextures?: WheelTextureUncheckedUpdateManyWithoutRelationshipNestedInput
  }

  export type RelationshipCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    relation: string
    comment?: string | null
    reelId?: number | null
  }

  export type RelationshipUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RelationshipUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type RecordCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    coverUrl?: string | null
    name?: string | null
    subName?: string | null
    description?: string | null
    bgm?: string | null
    color?: string | null
    userName?: string | null
    birthDate?: string | null
    displayMode?: string | null
    user?: UserCreateNestedOneWithoutRecordsInput
    recordItems?: RecordItemCreateNestedManyWithoutRecordInput
  }

  export type RecordUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    coverUrl?: string | null
    name?: string | null
    subName?: string | null
    description?: string | null
    bgm?: string | null
    color?: string | null
    userId?: number | null
    userName?: string | null
    birthDate?: string | null
    displayMode?: string | null
    recordItems?: RecordItemUncheckedCreateNestedManyWithoutRecordInput
  }

  export type RecordUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    subName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    bgm?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableStringFieldUpdateOperationsInput | string | null
    displayMode?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneWithoutRecordsNestedInput
    recordItems?: RecordItemUpdateManyWithoutRecordNestedInput
  }

  export type RecordUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    subName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    bgm?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableStringFieldUpdateOperationsInput | string | null
    displayMode?: NullableStringFieldUpdateOperationsInput | string | null
    recordItems?: RecordItemUncheckedUpdateManyWithoutRecordNestedInput
  }

  export type RecordCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    coverUrl?: string | null
    name?: string | null
    subName?: string | null
    description?: string | null
    bgm?: string | null
    color?: string | null
    userId?: number | null
    userName?: string | null
    birthDate?: string | null
    displayMode?: string | null
  }

  export type RecordUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    subName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    bgm?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableStringFieldUpdateOperationsInput | string | null
    displayMode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RecordUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    subName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    bgm?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableStringFieldUpdateOperationsInput | string | null
    displayMode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RecordItemCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    title?: string | null
    date?: string | null
    location?: string | null
    description?: string | null
    color?: string | null
    isHighlight?: boolean
    coverUrl?: string | null
    images?: RecordItemCreateimagesInput | string[]
    record: RecordCreateNestedOneWithoutRecordItemsInput
  }

  export type RecordItemUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    title?: string | null
    date?: string | null
    location?: string | null
    description?: string | null
    color?: string | null
    isHighlight?: boolean
    coverUrl?: string | null
    images?: RecordItemCreateimagesInput | string[]
    recordId: number
  }

  export type RecordItemUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    images?: RecordItemUpdateimagesInput | string[]
    record?: RecordUpdateOneRequiredWithoutRecordItemsNestedInput
  }

  export type RecordItemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    images?: RecordItemUpdateimagesInput | string[]
    recordId?: IntFieldUpdateOperationsInput | number
  }

  export type RecordItemCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    title?: string | null
    date?: string | null
    location?: string | null
    description?: string | null
    color?: string | null
    isHighlight?: boolean
    coverUrl?: string | null
    images?: RecordItemCreateimagesInput | string[]
    recordId: number
  }

  export type RecordItemUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    images?: RecordItemUpdateimagesInput | string[]
  }

  export type RecordItemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    images?: RecordItemUpdateimagesInput | string[]
    recordId?: IntFieldUpdateOperationsInput | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type RecordListRelationFilter = {
    every?: RecordWhereInput
    some?: RecordWhereInput
    none?: RecordWhereInput
  }

  export type ReelListRelationFilter = {
    every?: ReelWhereInput
    some?: ReelWhereInput
    none?: ReelWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RecordOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    mobile?: SortOrder
    plan?: SortOrder
    birthDate?: SortOrder
    email?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    mobile?: SortOrder
    plan?: SortOrder
    birthDate?: SortOrder
    email?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    mobile?: SortOrder
    plan?: SortOrder
    birthDate?: SortOrder
    email?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type LifestoryNullableScalarRelationFilter = {
    is?: LifestoryWhereInput | null
    isNot?: LifestoryWhereInput | null
  }

  export type MemoryListRelationFilter = {
    every?: MemoryWhereInput
    some?: MemoryWhereInput
    none?: MemoryWhereInput
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type RelationshipListRelationFilter = {
    every?: RelationshipWhereInput
    some?: RelationshipWhereInput
    none?: RelationshipWhereInput
  }

  export type WheelTextureListRelationFilter = {
    every?: WheelTextureWhereInput
    some?: WheelTextureWhereInput
    none?: WheelTextureWhereInput
  }

  export type MemoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RelationshipOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WheelTextureOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReelCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    name?: SortOrder
    birthDate?: SortOrder
    profileImg?: SortOrder
    birthPlace?: SortOrder
    motto?: SortOrder
    lifestoryId?: SortOrder
    userId?: SortOrder
  }

  export type ReelAvgOrderByAggregateInput = {
    id?: SortOrder
    lifestoryId?: SortOrder
    userId?: SortOrder
  }

  export type ReelMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    name?: SortOrder
    birthDate?: SortOrder
    profileImg?: SortOrder
    birthPlace?: SortOrder
    motto?: SortOrder
    lifestoryId?: SortOrder
    userId?: SortOrder
  }

  export type ReelMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    name?: SortOrder
    birthDate?: SortOrder
    profileImg?: SortOrder
    birthPlace?: SortOrder
    motto?: SortOrder
    lifestoryId?: SortOrder
    userId?: SortOrder
  }

  export type ReelSumOrderByAggregateInput = {
    id?: SortOrder
    lifestoryId?: SortOrder
    userId?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ReelScalarRelationFilter = {
    is?: ReelWhereInput
    isNot?: ReelWhereInput
  }

  export type LifestoryCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tokenUsage?: SortOrder
    mood?: SortOrder
    qaCount?: SortOrder
    qaList?: SortOrder
    result?: SortOrder
    reelId?: SortOrder
  }

  export type LifestoryAvgOrderByAggregateInput = {
    id?: SortOrder
    tokenUsage?: SortOrder
    qaCount?: SortOrder
    reelId?: SortOrder
  }

  export type LifestoryMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tokenUsage?: SortOrder
    mood?: SortOrder
    qaCount?: SortOrder
    result?: SortOrder
    reelId?: SortOrder
  }

  export type LifestoryMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tokenUsage?: SortOrder
    mood?: SortOrder
    qaCount?: SortOrder
    result?: SortOrder
    reelId?: SortOrder
  }

  export type LifestorySumOrderByAggregateInput = {
    id?: SortOrder
    tokenUsage?: SortOrder
    qaCount?: SortOrder
    reelId?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type MemoryNullableScalarRelationFilter = {
    is?: MemoryWhereInput | null
    isNot?: MemoryWhereInput | null
  }

  export type ReelNullableScalarRelationFilter = {
    is?: ReelWhereInput | null
    isNot?: ReelWhereInput | null
  }

  export type RelationshipNullableScalarRelationFilter = {
    is?: RelationshipWhereInput | null
    isNot?: RelationshipWhereInput | null
  }

  export type WheelTextureCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    srcType?: SortOrder
    srcUrl?: SortOrder
    memoryId?: SortOrder
    relationshipId?: SortOrder
    caption?: SortOrder
    reelId?: SortOrder
  }

  export type WheelTextureAvgOrderByAggregateInput = {
    id?: SortOrder
    srcType?: SortOrder
    memoryId?: SortOrder
    relationshipId?: SortOrder
    reelId?: SortOrder
  }

  export type WheelTextureMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    srcType?: SortOrder
    srcUrl?: SortOrder
    memoryId?: SortOrder
    relationshipId?: SortOrder
    caption?: SortOrder
    reelId?: SortOrder
  }

  export type WheelTextureMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    srcType?: SortOrder
    srcUrl?: SortOrder
    memoryId?: SortOrder
    relationshipId?: SortOrder
    caption?: SortOrder
    reelId?: SortOrder
  }

  export type WheelTextureSumOrderByAggregateInput = {
    id?: SortOrder
    srcType?: SortOrder
    memoryId?: SortOrder
    relationshipId?: SortOrder
    reelId?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type MemoryCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    subTitle?: SortOrder
    date?: SortOrder
    comment?: SortOrder
    reelId?: SortOrder
  }

  export type MemoryAvgOrderByAggregateInput = {
    id?: SortOrder
    reelId?: SortOrder
  }

  export type MemoryMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    subTitle?: SortOrder
    date?: SortOrder
    comment?: SortOrder
    reelId?: SortOrder
  }

  export type MemoryMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    subTitle?: SortOrder
    date?: SortOrder
    comment?: SortOrder
    reelId?: SortOrder
  }

  export type MemorySumOrderByAggregateInput = {
    id?: SortOrder
    reelId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type RelationshipCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    relation?: SortOrder
    comment?: SortOrder
    reelId?: SortOrder
  }

  export type RelationshipAvgOrderByAggregateInput = {
    id?: SortOrder
    reelId?: SortOrder
  }

  export type RelationshipMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    relation?: SortOrder
    comment?: SortOrder
    reelId?: SortOrder
  }

  export type RelationshipMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    relation?: SortOrder
    comment?: SortOrder
    reelId?: SortOrder
  }

  export type RelationshipSumOrderByAggregateInput = {
    id?: SortOrder
    reelId?: SortOrder
  }

  export type RecordItemListRelationFilter = {
    every?: RecordItemWhereInput
    some?: RecordItemWhereInput
    none?: RecordItemWhereInput
  }

  export type RecordItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RecordCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    coverUrl?: SortOrder
    name?: SortOrder
    subName?: SortOrder
    description?: SortOrder
    bgm?: SortOrder
    color?: SortOrder
    userId?: SortOrder
    userName?: SortOrder
    birthDate?: SortOrder
    displayMode?: SortOrder
  }

  export type RecordAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type RecordMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    coverUrl?: SortOrder
    name?: SortOrder
    subName?: SortOrder
    description?: SortOrder
    bgm?: SortOrder
    color?: SortOrder
    userId?: SortOrder
    userName?: SortOrder
    birthDate?: SortOrder
    displayMode?: SortOrder
  }

  export type RecordMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    identifier?: SortOrder
    coverUrl?: SortOrder
    name?: SortOrder
    subName?: SortOrder
    description?: SortOrder
    bgm?: SortOrder
    color?: SortOrder
    userId?: SortOrder
    userName?: SortOrder
    birthDate?: SortOrder
    displayMode?: SortOrder
  }

  export type RecordSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type RecordScalarRelationFilter = {
    is?: RecordWhereInput
    isNot?: RecordWhereInput
  }

  export type RecordItemCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    date?: SortOrder
    location?: SortOrder
    description?: SortOrder
    color?: SortOrder
    isHighlight?: SortOrder
    coverUrl?: SortOrder
    images?: SortOrder
    recordId?: SortOrder
  }

  export type RecordItemAvgOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
  }

  export type RecordItemMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    date?: SortOrder
    location?: SortOrder
    description?: SortOrder
    color?: SortOrder
    isHighlight?: SortOrder
    coverUrl?: SortOrder
    recordId?: SortOrder
  }

  export type RecordItemMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    date?: SortOrder
    location?: SortOrder
    description?: SortOrder
    color?: SortOrder
    isHighlight?: SortOrder
    coverUrl?: SortOrder
    recordId?: SortOrder
  }

  export type RecordItemSumOrderByAggregateInput = {
    id?: SortOrder
    recordId?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type RecordCreateNestedManyWithoutUserInput = {
    create?: XOR<RecordCreateWithoutUserInput, RecordUncheckedCreateWithoutUserInput> | RecordCreateWithoutUserInput[] | RecordUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RecordCreateOrConnectWithoutUserInput | RecordCreateOrConnectWithoutUserInput[]
    createMany?: RecordCreateManyUserInputEnvelope
    connect?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
  }

  export type ReelCreateNestedManyWithoutUserInput = {
    create?: XOR<ReelCreateWithoutUserInput, ReelUncheckedCreateWithoutUserInput> | ReelCreateWithoutUserInput[] | ReelUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReelCreateOrConnectWithoutUserInput | ReelCreateOrConnectWithoutUserInput[]
    createMany?: ReelCreateManyUserInputEnvelope
    connect?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
  }

  export type RecordUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<RecordCreateWithoutUserInput, RecordUncheckedCreateWithoutUserInput> | RecordCreateWithoutUserInput[] | RecordUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RecordCreateOrConnectWithoutUserInput | RecordCreateOrConnectWithoutUserInput[]
    createMany?: RecordCreateManyUserInputEnvelope
    connect?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
  }

  export type ReelUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ReelCreateWithoutUserInput, ReelUncheckedCreateWithoutUserInput> | ReelCreateWithoutUserInput[] | ReelUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReelCreateOrConnectWithoutUserInput | ReelCreateOrConnectWithoutUserInput[]
    createMany?: ReelCreateManyUserInputEnvelope
    connect?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type RecordUpdateManyWithoutUserNestedInput = {
    create?: XOR<RecordCreateWithoutUserInput, RecordUncheckedCreateWithoutUserInput> | RecordCreateWithoutUserInput[] | RecordUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RecordCreateOrConnectWithoutUserInput | RecordCreateOrConnectWithoutUserInput[]
    upsert?: RecordUpsertWithWhereUniqueWithoutUserInput | RecordUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RecordCreateManyUserInputEnvelope
    set?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
    disconnect?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
    delete?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
    connect?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
    update?: RecordUpdateWithWhereUniqueWithoutUserInput | RecordUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RecordUpdateManyWithWhereWithoutUserInput | RecordUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RecordScalarWhereInput | RecordScalarWhereInput[]
  }

  export type ReelUpdateManyWithoutUserNestedInput = {
    create?: XOR<ReelCreateWithoutUserInput, ReelUncheckedCreateWithoutUserInput> | ReelCreateWithoutUserInput[] | ReelUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReelCreateOrConnectWithoutUserInput | ReelCreateOrConnectWithoutUserInput[]
    upsert?: ReelUpsertWithWhereUniqueWithoutUserInput | ReelUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ReelCreateManyUserInputEnvelope
    set?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
    disconnect?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
    delete?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
    connect?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
    update?: ReelUpdateWithWhereUniqueWithoutUserInput | ReelUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ReelUpdateManyWithWhereWithoutUserInput | ReelUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ReelScalarWhereInput | ReelScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type RecordUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<RecordCreateWithoutUserInput, RecordUncheckedCreateWithoutUserInput> | RecordCreateWithoutUserInput[] | RecordUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RecordCreateOrConnectWithoutUserInput | RecordCreateOrConnectWithoutUserInput[]
    upsert?: RecordUpsertWithWhereUniqueWithoutUserInput | RecordUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RecordCreateManyUserInputEnvelope
    set?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
    disconnect?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
    delete?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
    connect?: RecordWhereUniqueInput | RecordWhereUniqueInput[]
    update?: RecordUpdateWithWhereUniqueWithoutUserInput | RecordUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RecordUpdateManyWithWhereWithoutUserInput | RecordUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RecordScalarWhereInput | RecordScalarWhereInput[]
  }

  export type ReelUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ReelCreateWithoutUserInput, ReelUncheckedCreateWithoutUserInput> | ReelCreateWithoutUserInput[] | ReelUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReelCreateOrConnectWithoutUserInput | ReelCreateOrConnectWithoutUserInput[]
    upsert?: ReelUpsertWithWhereUniqueWithoutUserInput | ReelUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ReelCreateManyUserInputEnvelope
    set?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
    disconnect?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
    delete?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
    connect?: ReelWhereUniqueInput | ReelWhereUniqueInput[]
    update?: ReelUpdateWithWhereUniqueWithoutUserInput | ReelUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ReelUpdateManyWithWhereWithoutUserInput | ReelUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ReelScalarWhereInput | ReelScalarWhereInput[]
  }

  export type LifestoryCreateNestedOneWithoutReelInput = {
    create?: XOR<LifestoryCreateWithoutReelInput, LifestoryUncheckedCreateWithoutReelInput>
    connectOrCreate?: LifestoryCreateOrConnectWithoutReelInput
    connect?: LifestoryWhereUniqueInput
  }

  export type MemoryCreateNestedManyWithoutReelInput = {
    create?: XOR<MemoryCreateWithoutReelInput, MemoryUncheckedCreateWithoutReelInput> | MemoryCreateWithoutReelInput[] | MemoryUncheckedCreateWithoutReelInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutReelInput | MemoryCreateOrConnectWithoutReelInput[]
    createMany?: MemoryCreateManyReelInputEnvelope
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutReelsInput = {
    create?: XOR<UserCreateWithoutReelsInput, UserUncheckedCreateWithoutReelsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReelsInput
    connect?: UserWhereUniqueInput
  }

  export type RelationshipCreateNestedManyWithoutReelsInput = {
    create?: XOR<RelationshipCreateWithoutReelsInput, RelationshipUncheckedCreateWithoutReelsInput> | RelationshipCreateWithoutReelsInput[] | RelationshipUncheckedCreateWithoutReelsInput[]
    connectOrCreate?: RelationshipCreateOrConnectWithoutReelsInput | RelationshipCreateOrConnectWithoutReelsInput[]
    createMany?: RelationshipCreateManyReelsInputEnvelope
    connect?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
  }

  export type WheelTextureCreateNestedManyWithoutReelsInput = {
    create?: XOR<WheelTextureCreateWithoutReelsInput, WheelTextureUncheckedCreateWithoutReelsInput> | WheelTextureCreateWithoutReelsInput[] | WheelTextureUncheckedCreateWithoutReelsInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutReelsInput | WheelTextureCreateOrConnectWithoutReelsInput[]
    createMany?: WheelTextureCreateManyReelsInputEnvelope
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
  }

  export type LifestoryUncheckedCreateNestedOneWithoutReelInput = {
    create?: XOR<LifestoryCreateWithoutReelInput, LifestoryUncheckedCreateWithoutReelInput>
    connectOrCreate?: LifestoryCreateOrConnectWithoutReelInput
    connect?: LifestoryWhereUniqueInput
  }

  export type MemoryUncheckedCreateNestedManyWithoutReelInput = {
    create?: XOR<MemoryCreateWithoutReelInput, MemoryUncheckedCreateWithoutReelInput> | MemoryCreateWithoutReelInput[] | MemoryUncheckedCreateWithoutReelInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutReelInput | MemoryCreateOrConnectWithoutReelInput[]
    createMany?: MemoryCreateManyReelInputEnvelope
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
  }

  export type RelationshipUncheckedCreateNestedManyWithoutReelsInput = {
    create?: XOR<RelationshipCreateWithoutReelsInput, RelationshipUncheckedCreateWithoutReelsInput> | RelationshipCreateWithoutReelsInput[] | RelationshipUncheckedCreateWithoutReelsInput[]
    connectOrCreate?: RelationshipCreateOrConnectWithoutReelsInput | RelationshipCreateOrConnectWithoutReelsInput[]
    createMany?: RelationshipCreateManyReelsInputEnvelope
    connect?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
  }

  export type WheelTextureUncheckedCreateNestedManyWithoutReelsInput = {
    create?: XOR<WheelTextureCreateWithoutReelsInput, WheelTextureUncheckedCreateWithoutReelsInput> | WheelTextureCreateWithoutReelsInput[] | WheelTextureUncheckedCreateWithoutReelsInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutReelsInput | WheelTextureCreateOrConnectWithoutReelsInput[]
    createMany?: WheelTextureCreateManyReelsInputEnvelope
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type LifestoryUpdateOneWithoutReelNestedInput = {
    create?: XOR<LifestoryCreateWithoutReelInput, LifestoryUncheckedCreateWithoutReelInput>
    connectOrCreate?: LifestoryCreateOrConnectWithoutReelInput
    upsert?: LifestoryUpsertWithoutReelInput
    disconnect?: LifestoryWhereInput | boolean
    delete?: LifestoryWhereInput | boolean
    connect?: LifestoryWhereUniqueInput
    update?: XOR<XOR<LifestoryUpdateToOneWithWhereWithoutReelInput, LifestoryUpdateWithoutReelInput>, LifestoryUncheckedUpdateWithoutReelInput>
  }

  export type MemoryUpdateManyWithoutReelNestedInput = {
    create?: XOR<MemoryCreateWithoutReelInput, MemoryUncheckedCreateWithoutReelInput> | MemoryCreateWithoutReelInput[] | MemoryUncheckedCreateWithoutReelInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutReelInput | MemoryCreateOrConnectWithoutReelInput[]
    upsert?: MemoryUpsertWithWhereUniqueWithoutReelInput | MemoryUpsertWithWhereUniqueWithoutReelInput[]
    createMany?: MemoryCreateManyReelInputEnvelope
    set?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    disconnect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    delete?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    update?: MemoryUpdateWithWhereUniqueWithoutReelInput | MemoryUpdateWithWhereUniqueWithoutReelInput[]
    updateMany?: MemoryUpdateManyWithWhereWithoutReelInput | MemoryUpdateManyWithWhereWithoutReelInput[]
    deleteMany?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
  }

  export type UserUpdateOneWithoutReelsNestedInput = {
    create?: XOR<UserCreateWithoutReelsInput, UserUncheckedCreateWithoutReelsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReelsInput
    upsert?: UserUpsertWithoutReelsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReelsInput, UserUpdateWithoutReelsInput>, UserUncheckedUpdateWithoutReelsInput>
  }

  export type RelationshipUpdateManyWithoutReelsNestedInput = {
    create?: XOR<RelationshipCreateWithoutReelsInput, RelationshipUncheckedCreateWithoutReelsInput> | RelationshipCreateWithoutReelsInput[] | RelationshipUncheckedCreateWithoutReelsInput[]
    connectOrCreate?: RelationshipCreateOrConnectWithoutReelsInput | RelationshipCreateOrConnectWithoutReelsInput[]
    upsert?: RelationshipUpsertWithWhereUniqueWithoutReelsInput | RelationshipUpsertWithWhereUniqueWithoutReelsInput[]
    createMany?: RelationshipCreateManyReelsInputEnvelope
    set?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
    disconnect?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
    delete?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
    connect?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
    update?: RelationshipUpdateWithWhereUniqueWithoutReelsInput | RelationshipUpdateWithWhereUniqueWithoutReelsInput[]
    updateMany?: RelationshipUpdateManyWithWhereWithoutReelsInput | RelationshipUpdateManyWithWhereWithoutReelsInput[]
    deleteMany?: RelationshipScalarWhereInput | RelationshipScalarWhereInput[]
  }

  export type WheelTextureUpdateManyWithoutReelsNestedInput = {
    create?: XOR<WheelTextureCreateWithoutReelsInput, WheelTextureUncheckedCreateWithoutReelsInput> | WheelTextureCreateWithoutReelsInput[] | WheelTextureUncheckedCreateWithoutReelsInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutReelsInput | WheelTextureCreateOrConnectWithoutReelsInput[]
    upsert?: WheelTextureUpsertWithWhereUniqueWithoutReelsInput | WheelTextureUpsertWithWhereUniqueWithoutReelsInput[]
    createMany?: WheelTextureCreateManyReelsInputEnvelope
    set?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    disconnect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    delete?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    update?: WheelTextureUpdateWithWhereUniqueWithoutReelsInput | WheelTextureUpdateWithWhereUniqueWithoutReelsInput[]
    updateMany?: WheelTextureUpdateManyWithWhereWithoutReelsInput | WheelTextureUpdateManyWithWhereWithoutReelsInput[]
    deleteMany?: WheelTextureScalarWhereInput | WheelTextureScalarWhereInput[]
  }

  export type LifestoryUncheckedUpdateOneWithoutReelNestedInput = {
    create?: XOR<LifestoryCreateWithoutReelInput, LifestoryUncheckedCreateWithoutReelInput>
    connectOrCreate?: LifestoryCreateOrConnectWithoutReelInput
    upsert?: LifestoryUpsertWithoutReelInput
    disconnect?: LifestoryWhereInput | boolean
    delete?: LifestoryWhereInput | boolean
    connect?: LifestoryWhereUniqueInput
    update?: XOR<XOR<LifestoryUpdateToOneWithWhereWithoutReelInput, LifestoryUpdateWithoutReelInput>, LifestoryUncheckedUpdateWithoutReelInput>
  }

  export type MemoryUncheckedUpdateManyWithoutReelNestedInput = {
    create?: XOR<MemoryCreateWithoutReelInput, MemoryUncheckedCreateWithoutReelInput> | MemoryCreateWithoutReelInput[] | MemoryUncheckedCreateWithoutReelInput[]
    connectOrCreate?: MemoryCreateOrConnectWithoutReelInput | MemoryCreateOrConnectWithoutReelInput[]
    upsert?: MemoryUpsertWithWhereUniqueWithoutReelInput | MemoryUpsertWithWhereUniqueWithoutReelInput[]
    createMany?: MemoryCreateManyReelInputEnvelope
    set?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    disconnect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    delete?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    connect?: MemoryWhereUniqueInput | MemoryWhereUniqueInput[]
    update?: MemoryUpdateWithWhereUniqueWithoutReelInput | MemoryUpdateWithWhereUniqueWithoutReelInput[]
    updateMany?: MemoryUpdateManyWithWhereWithoutReelInput | MemoryUpdateManyWithWhereWithoutReelInput[]
    deleteMany?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
  }

  export type RelationshipUncheckedUpdateManyWithoutReelsNestedInput = {
    create?: XOR<RelationshipCreateWithoutReelsInput, RelationshipUncheckedCreateWithoutReelsInput> | RelationshipCreateWithoutReelsInput[] | RelationshipUncheckedCreateWithoutReelsInput[]
    connectOrCreate?: RelationshipCreateOrConnectWithoutReelsInput | RelationshipCreateOrConnectWithoutReelsInput[]
    upsert?: RelationshipUpsertWithWhereUniqueWithoutReelsInput | RelationshipUpsertWithWhereUniqueWithoutReelsInput[]
    createMany?: RelationshipCreateManyReelsInputEnvelope
    set?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
    disconnect?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
    delete?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
    connect?: RelationshipWhereUniqueInput | RelationshipWhereUniqueInput[]
    update?: RelationshipUpdateWithWhereUniqueWithoutReelsInput | RelationshipUpdateWithWhereUniqueWithoutReelsInput[]
    updateMany?: RelationshipUpdateManyWithWhereWithoutReelsInput | RelationshipUpdateManyWithWhereWithoutReelsInput[]
    deleteMany?: RelationshipScalarWhereInput | RelationshipScalarWhereInput[]
  }

  export type WheelTextureUncheckedUpdateManyWithoutReelsNestedInput = {
    create?: XOR<WheelTextureCreateWithoutReelsInput, WheelTextureUncheckedCreateWithoutReelsInput> | WheelTextureCreateWithoutReelsInput[] | WheelTextureUncheckedCreateWithoutReelsInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutReelsInput | WheelTextureCreateOrConnectWithoutReelsInput[]
    upsert?: WheelTextureUpsertWithWhereUniqueWithoutReelsInput | WheelTextureUpsertWithWhereUniqueWithoutReelsInput[]
    createMany?: WheelTextureCreateManyReelsInputEnvelope
    set?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    disconnect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    delete?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    update?: WheelTextureUpdateWithWhereUniqueWithoutReelsInput | WheelTextureUpdateWithWhereUniqueWithoutReelsInput[]
    updateMany?: WheelTextureUpdateManyWithWhereWithoutReelsInput | WheelTextureUpdateManyWithWhereWithoutReelsInput[]
    deleteMany?: WheelTextureScalarWhereInput | WheelTextureScalarWhereInput[]
  }

  export type ReelCreateNestedOneWithoutLifestoryInput = {
    create?: XOR<ReelCreateWithoutLifestoryInput, ReelUncheckedCreateWithoutLifestoryInput>
    connectOrCreate?: ReelCreateOrConnectWithoutLifestoryInput
    connect?: ReelWhereUniqueInput
  }

  export type ReelUpdateOneRequiredWithoutLifestoryNestedInput = {
    create?: XOR<ReelCreateWithoutLifestoryInput, ReelUncheckedCreateWithoutLifestoryInput>
    connectOrCreate?: ReelCreateOrConnectWithoutLifestoryInput
    upsert?: ReelUpsertWithoutLifestoryInput
    connect?: ReelWhereUniqueInput
    update?: XOR<XOR<ReelUpdateToOneWithWhereWithoutLifestoryInput, ReelUpdateWithoutLifestoryInput>, ReelUncheckedUpdateWithoutLifestoryInput>
  }

  export type MemoryCreateNestedOneWithoutWheelTexturesInput = {
    create?: XOR<MemoryCreateWithoutWheelTexturesInput, MemoryUncheckedCreateWithoutWheelTexturesInput>
    connectOrCreate?: MemoryCreateOrConnectWithoutWheelTexturesInput
    connect?: MemoryWhereUniqueInput
  }

  export type ReelCreateNestedOneWithoutChildhoodInput = {
    create?: XOR<ReelCreateWithoutChildhoodInput, ReelUncheckedCreateWithoutChildhoodInput>
    connectOrCreate?: ReelCreateOrConnectWithoutChildhoodInput
    connect?: ReelWhereUniqueInput
  }

  export type RelationshipCreateNestedOneWithoutWheelTexturesInput = {
    create?: XOR<RelationshipCreateWithoutWheelTexturesInput, RelationshipUncheckedCreateWithoutWheelTexturesInput>
    connectOrCreate?: RelationshipCreateOrConnectWithoutWheelTexturesInput
    connect?: RelationshipWhereUniqueInput
  }

  export type MemoryUpdateOneWithoutWheelTexturesNestedInput = {
    create?: XOR<MemoryCreateWithoutWheelTexturesInput, MemoryUncheckedCreateWithoutWheelTexturesInput>
    connectOrCreate?: MemoryCreateOrConnectWithoutWheelTexturesInput
    upsert?: MemoryUpsertWithoutWheelTexturesInput
    disconnect?: MemoryWhereInput | boolean
    delete?: MemoryWhereInput | boolean
    connect?: MemoryWhereUniqueInput
    update?: XOR<XOR<MemoryUpdateToOneWithWhereWithoutWheelTexturesInput, MemoryUpdateWithoutWheelTexturesInput>, MemoryUncheckedUpdateWithoutWheelTexturesInput>
  }

  export type ReelUpdateOneWithoutChildhoodNestedInput = {
    create?: XOR<ReelCreateWithoutChildhoodInput, ReelUncheckedCreateWithoutChildhoodInput>
    connectOrCreate?: ReelCreateOrConnectWithoutChildhoodInput
    upsert?: ReelUpsertWithoutChildhoodInput
    disconnect?: ReelWhereInput | boolean
    delete?: ReelWhereInput | boolean
    connect?: ReelWhereUniqueInput
    update?: XOR<XOR<ReelUpdateToOneWithWhereWithoutChildhoodInput, ReelUpdateWithoutChildhoodInput>, ReelUncheckedUpdateWithoutChildhoodInput>
  }

  export type RelationshipUpdateOneWithoutWheelTexturesNestedInput = {
    create?: XOR<RelationshipCreateWithoutWheelTexturesInput, RelationshipUncheckedCreateWithoutWheelTexturesInput>
    connectOrCreate?: RelationshipCreateOrConnectWithoutWheelTexturesInput
    upsert?: RelationshipUpsertWithoutWheelTexturesInput
    disconnect?: RelationshipWhereInput | boolean
    delete?: RelationshipWhereInput | boolean
    connect?: RelationshipWhereUniqueInput
    update?: XOR<XOR<RelationshipUpdateToOneWithWhereWithoutWheelTexturesInput, RelationshipUpdateWithoutWheelTexturesInput>, RelationshipUncheckedUpdateWithoutWheelTexturesInput>
  }

  export type ReelCreateNestedOneWithoutMemorysInput = {
    create?: XOR<ReelCreateWithoutMemorysInput, ReelUncheckedCreateWithoutMemorysInput>
    connectOrCreate?: ReelCreateOrConnectWithoutMemorysInput
    connect?: ReelWhereUniqueInput
  }

  export type WheelTextureCreateNestedManyWithoutMemoryInput = {
    create?: XOR<WheelTextureCreateWithoutMemoryInput, WheelTextureUncheckedCreateWithoutMemoryInput> | WheelTextureCreateWithoutMemoryInput[] | WheelTextureUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutMemoryInput | WheelTextureCreateOrConnectWithoutMemoryInput[]
    createMany?: WheelTextureCreateManyMemoryInputEnvelope
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
  }

  export type WheelTextureUncheckedCreateNestedManyWithoutMemoryInput = {
    create?: XOR<WheelTextureCreateWithoutMemoryInput, WheelTextureUncheckedCreateWithoutMemoryInput> | WheelTextureCreateWithoutMemoryInput[] | WheelTextureUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutMemoryInput | WheelTextureCreateOrConnectWithoutMemoryInput[]
    createMany?: WheelTextureCreateManyMemoryInputEnvelope
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ReelUpdateOneRequiredWithoutMemorysNestedInput = {
    create?: XOR<ReelCreateWithoutMemorysInput, ReelUncheckedCreateWithoutMemorysInput>
    connectOrCreate?: ReelCreateOrConnectWithoutMemorysInput
    upsert?: ReelUpsertWithoutMemorysInput
    connect?: ReelWhereUniqueInput
    update?: XOR<XOR<ReelUpdateToOneWithWhereWithoutMemorysInput, ReelUpdateWithoutMemorysInput>, ReelUncheckedUpdateWithoutMemorysInput>
  }

  export type WheelTextureUpdateManyWithoutMemoryNestedInput = {
    create?: XOR<WheelTextureCreateWithoutMemoryInput, WheelTextureUncheckedCreateWithoutMemoryInput> | WheelTextureCreateWithoutMemoryInput[] | WheelTextureUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutMemoryInput | WheelTextureCreateOrConnectWithoutMemoryInput[]
    upsert?: WheelTextureUpsertWithWhereUniqueWithoutMemoryInput | WheelTextureUpsertWithWhereUniqueWithoutMemoryInput[]
    createMany?: WheelTextureCreateManyMemoryInputEnvelope
    set?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    disconnect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    delete?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    update?: WheelTextureUpdateWithWhereUniqueWithoutMemoryInput | WheelTextureUpdateWithWhereUniqueWithoutMemoryInput[]
    updateMany?: WheelTextureUpdateManyWithWhereWithoutMemoryInput | WheelTextureUpdateManyWithWhereWithoutMemoryInput[]
    deleteMany?: WheelTextureScalarWhereInput | WheelTextureScalarWhereInput[]
  }

  export type WheelTextureUncheckedUpdateManyWithoutMemoryNestedInput = {
    create?: XOR<WheelTextureCreateWithoutMemoryInput, WheelTextureUncheckedCreateWithoutMemoryInput> | WheelTextureCreateWithoutMemoryInput[] | WheelTextureUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutMemoryInput | WheelTextureCreateOrConnectWithoutMemoryInput[]
    upsert?: WheelTextureUpsertWithWhereUniqueWithoutMemoryInput | WheelTextureUpsertWithWhereUniqueWithoutMemoryInput[]
    createMany?: WheelTextureCreateManyMemoryInputEnvelope
    set?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    disconnect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    delete?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    update?: WheelTextureUpdateWithWhereUniqueWithoutMemoryInput | WheelTextureUpdateWithWhereUniqueWithoutMemoryInput[]
    updateMany?: WheelTextureUpdateManyWithWhereWithoutMemoryInput | WheelTextureUpdateManyWithWhereWithoutMemoryInput[]
    deleteMany?: WheelTextureScalarWhereInput | WheelTextureScalarWhereInput[]
  }

  export type ReelCreateNestedOneWithoutRelationshipsInput = {
    create?: XOR<ReelCreateWithoutRelationshipsInput, ReelUncheckedCreateWithoutRelationshipsInput>
    connectOrCreate?: ReelCreateOrConnectWithoutRelationshipsInput
    connect?: ReelWhereUniqueInput
  }

  export type WheelTextureCreateNestedManyWithoutRelationshipInput = {
    create?: XOR<WheelTextureCreateWithoutRelationshipInput, WheelTextureUncheckedCreateWithoutRelationshipInput> | WheelTextureCreateWithoutRelationshipInput[] | WheelTextureUncheckedCreateWithoutRelationshipInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutRelationshipInput | WheelTextureCreateOrConnectWithoutRelationshipInput[]
    createMany?: WheelTextureCreateManyRelationshipInputEnvelope
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
  }

  export type WheelTextureUncheckedCreateNestedManyWithoutRelationshipInput = {
    create?: XOR<WheelTextureCreateWithoutRelationshipInput, WheelTextureUncheckedCreateWithoutRelationshipInput> | WheelTextureCreateWithoutRelationshipInput[] | WheelTextureUncheckedCreateWithoutRelationshipInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutRelationshipInput | WheelTextureCreateOrConnectWithoutRelationshipInput[]
    createMany?: WheelTextureCreateManyRelationshipInputEnvelope
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
  }

  export type ReelUpdateOneWithoutRelationshipsNestedInput = {
    create?: XOR<ReelCreateWithoutRelationshipsInput, ReelUncheckedCreateWithoutRelationshipsInput>
    connectOrCreate?: ReelCreateOrConnectWithoutRelationshipsInput
    upsert?: ReelUpsertWithoutRelationshipsInput
    disconnect?: ReelWhereInput | boolean
    delete?: ReelWhereInput | boolean
    connect?: ReelWhereUniqueInput
    update?: XOR<XOR<ReelUpdateToOneWithWhereWithoutRelationshipsInput, ReelUpdateWithoutRelationshipsInput>, ReelUncheckedUpdateWithoutRelationshipsInput>
  }

  export type WheelTextureUpdateManyWithoutRelationshipNestedInput = {
    create?: XOR<WheelTextureCreateWithoutRelationshipInput, WheelTextureUncheckedCreateWithoutRelationshipInput> | WheelTextureCreateWithoutRelationshipInput[] | WheelTextureUncheckedCreateWithoutRelationshipInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutRelationshipInput | WheelTextureCreateOrConnectWithoutRelationshipInput[]
    upsert?: WheelTextureUpsertWithWhereUniqueWithoutRelationshipInput | WheelTextureUpsertWithWhereUniqueWithoutRelationshipInput[]
    createMany?: WheelTextureCreateManyRelationshipInputEnvelope
    set?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    disconnect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    delete?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    update?: WheelTextureUpdateWithWhereUniqueWithoutRelationshipInput | WheelTextureUpdateWithWhereUniqueWithoutRelationshipInput[]
    updateMany?: WheelTextureUpdateManyWithWhereWithoutRelationshipInput | WheelTextureUpdateManyWithWhereWithoutRelationshipInput[]
    deleteMany?: WheelTextureScalarWhereInput | WheelTextureScalarWhereInput[]
  }

  export type WheelTextureUncheckedUpdateManyWithoutRelationshipNestedInput = {
    create?: XOR<WheelTextureCreateWithoutRelationshipInput, WheelTextureUncheckedCreateWithoutRelationshipInput> | WheelTextureCreateWithoutRelationshipInput[] | WheelTextureUncheckedCreateWithoutRelationshipInput[]
    connectOrCreate?: WheelTextureCreateOrConnectWithoutRelationshipInput | WheelTextureCreateOrConnectWithoutRelationshipInput[]
    upsert?: WheelTextureUpsertWithWhereUniqueWithoutRelationshipInput | WheelTextureUpsertWithWhereUniqueWithoutRelationshipInput[]
    createMany?: WheelTextureCreateManyRelationshipInputEnvelope
    set?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    disconnect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    delete?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    connect?: WheelTextureWhereUniqueInput | WheelTextureWhereUniqueInput[]
    update?: WheelTextureUpdateWithWhereUniqueWithoutRelationshipInput | WheelTextureUpdateWithWhereUniqueWithoutRelationshipInput[]
    updateMany?: WheelTextureUpdateManyWithWhereWithoutRelationshipInput | WheelTextureUpdateManyWithWhereWithoutRelationshipInput[]
    deleteMany?: WheelTextureScalarWhereInput | WheelTextureScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutRecordsInput = {
    create?: XOR<UserCreateWithoutRecordsInput, UserUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: UserCreateOrConnectWithoutRecordsInput
    connect?: UserWhereUniqueInput
  }

  export type RecordItemCreateNestedManyWithoutRecordInput = {
    create?: XOR<RecordItemCreateWithoutRecordInput, RecordItemUncheckedCreateWithoutRecordInput> | RecordItemCreateWithoutRecordInput[] | RecordItemUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: RecordItemCreateOrConnectWithoutRecordInput | RecordItemCreateOrConnectWithoutRecordInput[]
    createMany?: RecordItemCreateManyRecordInputEnvelope
    connect?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
  }

  export type RecordItemUncheckedCreateNestedManyWithoutRecordInput = {
    create?: XOR<RecordItemCreateWithoutRecordInput, RecordItemUncheckedCreateWithoutRecordInput> | RecordItemCreateWithoutRecordInput[] | RecordItemUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: RecordItemCreateOrConnectWithoutRecordInput | RecordItemCreateOrConnectWithoutRecordInput[]
    createMany?: RecordItemCreateManyRecordInputEnvelope
    connect?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
  }

  export type UserUpdateOneWithoutRecordsNestedInput = {
    create?: XOR<UserCreateWithoutRecordsInput, UserUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: UserCreateOrConnectWithoutRecordsInput
    upsert?: UserUpsertWithoutRecordsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutRecordsInput, UserUpdateWithoutRecordsInput>, UserUncheckedUpdateWithoutRecordsInput>
  }

  export type RecordItemUpdateManyWithoutRecordNestedInput = {
    create?: XOR<RecordItemCreateWithoutRecordInput, RecordItemUncheckedCreateWithoutRecordInput> | RecordItemCreateWithoutRecordInput[] | RecordItemUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: RecordItemCreateOrConnectWithoutRecordInput | RecordItemCreateOrConnectWithoutRecordInput[]
    upsert?: RecordItemUpsertWithWhereUniqueWithoutRecordInput | RecordItemUpsertWithWhereUniqueWithoutRecordInput[]
    createMany?: RecordItemCreateManyRecordInputEnvelope
    set?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
    disconnect?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
    delete?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
    connect?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
    update?: RecordItemUpdateWithWhereUniqueWithoutRecordInput | RecordItemUpdateWithWhereUniqueWithoutRecordInput[]
    updateMany?: RecordItemUpdateManyWithWhereWithoutRecordInput | RecordItemUpdateManyWithWhereWithoutRecordInput[]
    deleteMany?: RecordItemScalarWhereInput | RecordItemScalarWhereInput[]
  }

  export type RecordItemUncheckedUpdateManyWithoutRecordNestedInput = {
    create?: XOR<RecordItemCreateWithoutRecordInput, RecordItemUncheckedCreateWithoutRecordInput> | RecordItemCreateWithoutRecordInput[] | RecordItemUncheckedCreateWithoutRecordInput[]
    connectOrCreate?: RecordItemCreateOrConnectWithoutRecordInput | RecordItemCreateOrConnectWithoutRecordInput[]
    upsert?: RecordItemUpsertWithWhereUniqueWithoutRecordInput | RecordItemUpsertWithWhereUniqueWithoutRecordInput[]
    createMany?: RecordItemCreateManyRecordInputEnvelope
    set?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
    disconnect?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
    delete?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
    connect?: RecordItemWhereUniqueInput | RecordItemWhereUniqueInput[]
    update?: RecordItemUpdateWithWhereUniqueWithoutRecordInput | RecordItemUpdateWithWhereUniqueWithoutRecordInput[]
    updateMany?: RecordItemUpdateManyWithWhereWithoutRecordInput | RecordItemUpdateManyWithWhereWithoutRecordInput[]
    deleteMany?: RecordItemScalarWhereInput | RecordItemScalarWhereInput[]
  }

  export type RecordItemCreateimagesInput = {
    set: string[]
  }

  export type RecordCreateNestedOneWithoutRecordItemsInput = {
    create?: XOR<RecordCreateWithoutRecordItemsInput, RecordUncheckedCreateWithoutRecordItemsInput>
    connectOrCreate?: RecordCreateOrConnectWithoutRecordItemsInput
    connect?: RecordWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type RecordItemUpdateimagesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type RecordUpdateOneRequiredWithoutRecordItemsNestedInput = {
    create?: XOR<RecordCreateWithoutRecordItemsInput, RecordUncheckedCreateWithoutRecordItemsInput>
    connectOrCreate?: RecordCreateOrConnectWithoutRecordItemsInput
    upsert?: RecordUpsertWithoutRecordItemsInput
    connect?: RecordWhereUniqueInput
    update?: XOR<XOR<RecordUpdateToOneWithWhereWithoutRecordItemsInput, RecordUpdateWithoutRecordItemsInput>, RecordUncheckedUpdateWithoutRecordItemsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type RecordCreateWithoutUserInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    coverUrl?: string | null
    name?: string | null
    subName?: string | null
    description?: string | null
    bgm?: string | null
    color?: string | null
    userName?: string | null
    birthDate?: string | null
    displayMode?: string | null
    recordItems?: RecordItemCreateNestedManyWithoutRecordInput
  }

  export type RecordUncheckedCreateWithoutUserInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    coverUrl?: string | null
    name?: string | null
    subName?: string | null
    description?: string | null
    bgm?: string | null
    color?: string | null
    userName?: string | null
    birthDate?: string | null
    displayMode?: string | null
    recordItems?: RecordItemUncheckedCreateNestedManyWithoutRecordInput
  }

  export type RecordCreateOrConnectWithoutUserInput = {
    where: RecordWhereUniqueInput
    create: XOR<RecordCreateWithoutUserInput, RecordUncheckedCreateWithoutUserInput>
  }

  export type RecordCreateManyUserInputEnvelope = {
    data: RecordCreateManyUserInput | RecordCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ReelCreateWithoutUserInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    lifestory?: LifestoryCreateNestedOneWithoutReelInput
    memorys?: MemoryCreateNestedManyWithoutReelInput
    relationships?: RelationshipCreateNestedManyWithoutReelsInput
    childhood?: WheelTextureCreateNestedManyWithoutReelsInput
  }

  export type ReelUncheckedCreateWithoutUserInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    lifestory?: LifestoryUncheckedCreateNestedOneWithoutReelInput
    memorys?: MemoryUncheckedCreateNestedManyWithoutReelInput
    relationships?: RelationshipUncheckedCreateNestedManyWithoutReelsInput
    childhood?: WheelTextureUncheckedCreateNestedManyWithoutReelsInput
  }

  export type ReelCreateOrConnectWithoutUserInput = {
    where: ReelWhereUniqueInput
    create: XOR<ReelCreateWithoutUserInput, ReelUncheckedCreateWithoutUserInput>
  }

  export type ReelCreateManyUserInputEnvelope = {
    data: ReelCreateManyUserInput | ReelCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type RecordUpsertWithWhereUniqueWithoutUserInput = {
    where: RecordWhereUniqueInput
    update: XOR<RecordUpdateWithoutUserInput, RecordUncheckedUpdateWithoutUserInput>
    create: XOR<RecordCreateWithoutUserInput, RecordUncheckedCreateWithoutUserInput>
  }

  export type RecordUpdateWithWhereUniqueWithoutUserInput = {
    where: RecordWhereUniqueInput
    data: XOR<RecordUpdateWithoutUserInput, RecordUncheckedUpdateWithoutUserInput>
  }

  export type RecordUpdateManyWithWhereWithoutUserInput = {
    where: RecordScalarWhereInput
    data: XOR<RecordUpdateManyMutationInput, RecordUncheckedUpdateManyWithoutUserInput>
  }

  export type RecordScalarWhereInput = {
    AND?: RecordScalarWhereInput | RecordScalarWhereInput[]
    OR?: RecordScalarWhereInput[]
    NOT?: RecordScalarWhereInput | RecordScalarWhereInput[]
    id?: IntFilter<"Record"> | number
    createdAt?: DateTimeFilter<"Record"> | Date | string
    updatedAt?: DateTimeFilter<"Record"> | Date | string
    identifier?: StringFilter<"Record"> | string
    coverUrl?: StringNullableFilter<"Record"> | string | null
    name?: StringNullableFilter<"Record"> | string | null
    subName?: StringNullableFilter<"Record"> | string | null
    description?: StringNullableFilter<"Record"> | string | null
    bgm?: StringNullableFilter<"Record"> | string | null
    color?: StringNullableFilter<"Record"> | string | null
    userId?: IntNullableFilter<"Record"> | number | null
    userName?: StringNullableFilter<"Record"> | string | null
    birthDate?: StringNullableFilter<"Record"> | string | null
    displayMode?: StringNullableFilter<"Record"> | string | null
  }

  export type ReelUpsertWithWhereUniqueWithoutUserInput = {
    where: ReelWhereUniqueInput
    update: XOR<ReelUpdateWithoutUserInput, ReelUncheckedUpdateWithoutUserInput>
    create: XOR<ReelCreateWithoutUserInput, ReelUncheckedCreateWithoutUserInput>
  }

  export type ReelUpdateWithWhereUniqueWithoutUserInput = {
    where: ReelWhereUniqueInput
    data: XOR<ReelUpdateWithoutUserInput, ReelUncheckedUpdateWithoutUserInput>
  }

  export type ReelUpdateManyWithWhereWithoutUserInput = {
    where: ReelScalarWhereInput
    data: XOR<ReelUpdateManyMutationInput, ReelUncheckedUpdateManyWithoutUserInput>
  }

  export type ReelScalarWhereInput = {
    AND?: ReelScalarWhereInput | ReelScalarWhereInput[]
    OR?: ReelScalarWhereInput[]
    NOT?: ReelScalarWhereInput | ReelScalarWhereInput[]
    id?: IntFilter<"Reel"> | number
    createdAt?: DateTimeFilter<"Reel"> | Date | string
    updatedAt?: DateTimeFilter<"Reel"> | Date | string
    identifier?: StringFilter<"Reel"> | string
    name?: StringFilter<"Reel"> | string
    birthDate?: StringFilter<"Reel"> | string
    profileImg?: StringNullableFilter<"Reel"> | string | null
    birthPlace?: StringNullableFilter<"Reel"> | string | null
    motto?: StringNullableFilter<"Reel"> | string | null
    lifestoryId?: IntNullableFilter<"Reel"> | number | null
    userId?: IntNullableFilter<"Reel"> | number | null
  }

  export type LifestoryCreateWithoutReelInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    tokenUsage?: number
    mood?: string | null
    qaCount?: number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: string | null
  }

  export type LifestoryUncheckedCreateWithoutReelInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tokenUsage?: number
    mood?: string | null
    qaCount?: number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: string | null
  }

  export type LifestoryCreateOrConnectWithoutReelInput = {
    where: LifestoryWhereUniqueInput
    create: XOR<LifestoryCreateWithoutReelInput, LifestoryUncheckedCreateWithoutReelInput>
  }

  export type MemoryCreateWithoutReelInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    subTitle?: string | null
    date?: Date | string | null
    comment?: string | null
    wheelTextures?: WheelTextureCreateNestedManyWithoutMemoryInput
  }

  export type MemoryUncheckedCreateWithoutReelInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    subTitle?: string | null
    date?: Date | string | null
    comment?: string | null
    wheelTextures?: WheelTextureUncheckedCreateNestedManyWithoutMemoryInput
  }

  export type MemoryCreateOrConnectWithoutReelInput = {
    where: MemoryWhereUniqueInput
    create: XOR<MemoryCreateWithoutReelInput, MemoryUncheckedCreateWithoutReelInput>
  }

  export type MemoryCreateManyReelInputEnvelope = {
    data: MemoryCreateManyReelInput | MemoryCreateManyReelInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutReelsInput = {
    name: string
    mobile: string
    plan?: string
    birthDate: string
    email?: string | null
    records?: RecordCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutReelsInput = {
    id?: number
    name: string
    mobile: string
    plan?: string
    birthDate: string
    email?: string | null
    records?: RecordUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutReelsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReelsInput, UserUncheckedCreateWithoutReelsInput>
  }

  export type RelationshipCreateWithoutReelsInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    relation: string
    comment?: string | null
    wheelTextures?: WheelTextureCreateNestedManyWithoutRelationshipInput
  }

  export type RelationshipUncheckedCreateWithoutReelsInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    relation: string
    comment?: string | null
    wheelTextures?: WheelTextureUncheckedCreateNestedManyWithoutRelationshipInput
  }

  export type RelationshipCreateOrConnectWithoutReelsInput = {
    where: RelationshipWhereUniqueInput
    create: XOR<RelationshipCreateWithoutReelsInput, RelationshipUncheckedCreateWithoutReelsInput>
  }

  export type RelationshipCreateManyReelsInputEnvelope = {
    data: RelationshipCreateManyReelsInput | RelationshipCreateManyReelsInput[]
    skipDuplicates?: boolean
  }

  export type WheelTextureCreateWithoutReelsInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    caption?: string | null
    memory?: MemoryCreateNestedOneWithoutWheelTexturesInput
    relationship?: RelationshipCreateNestedOneWithoutWheelTexturesInput
  }

  export type WheelTextureUncheckedCreateWithoutReelsInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    memoryId?: number | null
    relationshipId?: number | null
    caption?: string | null
  }

  export type WheelTextureCreateOrConnectWithoutReelsInput = {
    where: WheelTextureWhereUniqueInput
    create: XOR<WheelTextureCreateWithoutReelsInput, WheelTextureUncheckedCreateWithoutReelsInput>
  }

  export type WheelTextureCreateManyReelsInputEnvelope = {
    data: WheelTextureCreateManyReelsInput | WheelTextureCreateManyReelsInput[]
    skipDuplicates?: boolean
  }

  export type LifestoryUpsertWithoutReelInput = {
    update: XOR<LifestoryUpdateWithoutReelInput, LifestoryUncheckedUpdateWithoutReelInput>
    create: XOR<LifestoryCreateWithoutReelInput, LifestoryUncheckedCreateWithoutReelInput>
    where?: LifestoryWhereInput
  }

  export type LifestoryUpdateToOneWithWhereWithoutReelInput = {
    where?: LifestoryWhereInput
    data: XOR<LifestoryUpdateWithoutReelInput, LifestoryUncheckedUpdateWithoutReelInput>
  }

  export type LifestoryUpdateWithoutReelInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tokenUsage?: IntFieldUpdateOperationsInput | number
    mood?: NullableStringFieldUpdateOperationsInput | string | null
    qaCount?: NullableIntFieldUpdateOperationsInput | number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LifestoryUncheckedUpdateWithoutReelInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tokenUsage?: IntFieldUpdateOperationsInput | number
    mood?: NullableStringFieldUpdateOperationsInput | string | null
    qaCount?: NullableIntFieldUpdateOperationsInput | number | null
    qaList?: NullableJsonNullValueInput | InputJsonValue
    result?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MemoryUpsertWithWhereUniqueWithoutReelInput = {
    where: MemoryWhereUniqueInput
    update: XOR<MemoryUpdateWithoutReelInput, MemoryUncheckedUpdateWithoutReelInput>
    create: XOR<MemoryCreateWithoutReelInput, MemoryUncheckedCreateWithoutReelInput>
  }

  export type MemoryUpdateWithWhereUniqueWithoutReelInput = {
    where: MemoryWhereUniqueInput
    data: XOR<MemoryUpdateWithoutReelInput, MemoryUncheckedUpdateWithoutReelInput>
  }

  export type MemoryUpdateManyWithWhereWithoutReelInput = {
    where: MemoryScalarWhereInput
    data: XOR<MemoryUpdateManyMutationInput, MemoryUncheckedUpdateManyWithoutReelInput>
  }

  export type MemoryScalarWhereInput = {
    AND?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
    OR?: MemoryScalarWhereInput[]
    NOT?: MemoryScalarWhereInput | MemoryScalarWhereInput[]
    id?: IntFilter<"Memory"> | number
    createdAt?: DateTimeFilter<"Memory"> | Date | string
    updatedAt?: DateTimeFilter<"Memory"> | Date | string
    title?: StringFilter<"Memory"> | string
    subTitle?: StringNullableFilter<"Memory"> | string | null
    date?: DateTimeNullableFilter<"Memory"> | Date | string | null
    comment?: StringNullableFilter<"Memory"> | string | null
    reelId?: IntFilter<"Memory"> | number
  }

  export type UserUpsertWithoutReelsInput = {
    update: XOR<UserUpdateWithoutReelsInput, UserUncheckedUpdateWithoutReelsInput>
    create: XOR<UserCreateWithoutReelsInput, UserUncheckedCreateWithoutReelsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReelsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReelsInput, UserUncheckedUpdateWithoutReelsInput>
  }

  export type UserUpdateWithoutReelsInput = {
    name?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    records?: RecordUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutReelsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    records?: RecordUncheckedUpdateManyWithoutUserNestedInput
  }

  export type RelationshipUpsertWithWhereUniqueWithoutReelsInput = {
    where: RelationshipWhereUniqueInput
    update: XOR<RelationshipUpdateWithoutReelsInput, RelationshipUncheckedUpdateWithoutReelsInput>
    create: XOR<RelationshipCreateWithoutReelsInput, RelationshipUncheckedCreateWithoutReelsInput>
  }

  export type RelationshipUpdateWithWhereUniqueWithoutReelsInput = {
    where: RelationshipWhereUniqueInput
    data: XOR<RelationshipUpdateWithoutReelsInput, RelationshipUncheckedUpdateWithoutReelsInput>
  }

  export type RelationshipUpdateManyWithWhereWithoutReelsInput = {
    where: RelationshipScalarWhereInput
    data: XOR<RelationshipUpdateManyMutationInput, RelationshipUncheckedUpdateManyWithoutReelsInput>
  }

  export type RelationshipScalarWhereInput = {
    AND?: RelationshipScalarWhereInput | RelationshipScalarWhereInput[]
    OR?: RelationshipScalarWhereInput[]
    NOT?: RelationshipScalarWhereInput | RelationshipScalarWhereInput[]
    id?: IntFilter<"Relationship"> | number
    createdAt?: DateTimeFilter<"Relationship"> | Date | string
    updatedAt?: DateTimeFilter<"Relationship"> | Date | string
    name?: StringFilter<"Relationship"> | string
    relation?: StringFilter<"Relationship"> | string
    comment?: StringNullableFilter<"Relationship"> | string | null
    reelId?: IntNullableFilter<"Relationship"> | number | null
  }

  export type WheelTextureUpsertWithWhereUniqueWithoutReelsInput = {
    where: WheelTextureWhereUniqueInput
    update: XOR<WheelTextureUpdateWithoutReelsInput, WheelTextureUncheckedUpdateWithoutReelsInput>
    create: XOR<WheelTextureCreateWithoutReelsInput, WheelTextureUncheckedCreateWithoutReelsInput>
  }

  export type WheelTextureUpdateWithWhereUniqueWithoutReelsInput = {
    where: WheelTextureWhereUniqueInput
    data: XOR<WheelTextureUpdateWithoutReelsInput, WheelTextureUncheckedUpdateWithoutReelsInput>
  }

  export type WheelTextureUpdateManyWithWhereWithoutReelsInput = {
    where: WheelTextureScalarWhereInput
    data: XOR<WheelTextureUpdateManyMutationInput, WheelTextureUncheckedUpdateManyWithoutReelsInput>
  }

  export type WheelTextureScalarWhereInput = {
    AND?: WheelTextureScalarWhereInput | WheelTextureScalarWhereInput[]
    OR?: WheelTextureScalarWhereInput[]
    NOT?: WheelTextureScalarWhereInput | WheelTextureScalarWhereInput[]
    id?: IntFilter<"WheelTexture"> | number
    createdAt?: DateTimeFilter<"WheelTexture"> | Date | string
    updatedAt?: DateTimeFilter<"WheelTexture"> | Date | string
    srcType?: IntFilter<"WheelTexture"> | number
    srcUrl?: StringFilter<"WheelTexture"> | string
    memoryId?: IntNullableFilter<"WheelTexture"> | number | null
    relationshipId?: IntNullableFilter<"WheelTexture"> | number | null
    caption?: StringNullableFilter<"WheelTexture"> | string | null
    reelId?: IntNullableFilter<"WheelTexture"> | number | null
  }

  export type ReelCreateWithoutLifestoryInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    memorys?: MemoryCreateNestedManyWithoutReelInput
    user?: UserCreateNestedOneWithoutReelsInput
    relationships?: RelationshipCreateNestedManyWithoutReelsInput
    childhood?: WheelTextureCreateNestedManyWithoutReelsInput
  }

  export type ReelUncheckedCreateWithoutLifestoryInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    userId?: number | null
    memorys?: MemoryUncheckedCreateNestedManyWithoutReelInput
    relationships?: RelationshipUncheckedCreateNestedManyWithoutReelsInput
    childhood?: WheelTextureUncheckedCreateNestedManyWithoutReelsInput
  }

  export type ReelCreateOrConnectWithoutLifestoryInput = {
    where: ReelWhereUniqueInput
    create: XOR<ReelCreateWithoutLifestoryInput, ReelUncheckedCreateWithoutLifestoryInput>
  }

  export type ReelUpsertWithoutLifestoryInput = {
    update: XOR<ReelUpdateWithoutLifestoryInput, ReelUncheckedUpdateWithoutLifestoryInput>
    create: XOR<ReelCreateWithoutLifestoryInput, ReelUncheckedCreateWithoutLifestoryInput>
    where?: ReelWhereInput
  }

  export type ReelUpdateToOneWithWhereWithoutLifestoryInput = {
    where?: ReelWhereInput
    data: XOR<ReelUpdateWithoutLifestoryInput, ReelUncheckedUpdateWithoutLifestoryInput>
  }

  export type ReelUpdateWithoutLifestoryInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    memorys?: MemoryUpdateManyWithoutReelNestedInput
    user?: UserUpdateOneWithoutReelsNestedInput
    relationships?: RelationshipUpdateManyWithoutReelsNestedInput
    childhood?: WheelTextureUpdateManyWithoutReelsNestedInput
  }

  export type ReelUncheckedUpdateWithoutLifestoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    memorys?: MemoryUncheckedUpdateManyWithoutReelNestedInput
    relationships?: RelationshipUncheckedUpdateManyWithoutReelsNestedInput
    childhood?: WheelTextureUncheckedUpdateManyWithoutReelsNestedInput
  }

  export type MemoryCreateWithoutWheelTexturesInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    subTitle?: string | null
    date?: Date | string | null
    comment?: string | null
    reel: ReelCreateNestedOneWithoutMemorysInput
  }

  export type MemoryUncheckedCreateWithoutWheelTexturesInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    subTitle?: string | null
    date?: Date | string | null
    comment?: string | null
    reelId: number
  }

  export type MemoryCreateOrConnectWithoutWheelTexturesInput = {
    where: MemoryWhereUniqueInput
    create: XOR<MemoryCreateWithoutWheelTexturesInput, MemoryUncheckedCreateWithoutWheelTexturesInput>
  }

  export type ReelCreateWithoutChildhoodInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    lifestory?: LifestoryCreateNestedOneWithoutReelInput
    memorys?: MemoryCreateNestedManyWithoutReelInput
    user?: UserCreateNestedOneWithoutReelsInput
    relationships?: RelationshipCreateNestedManyWithoutReelsInput
  }

  export type ReelUncheckedCreateWithoutChildhoodInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    userId?: number | null
    lifestory?: LifestoryUncheckedCreateNestedOneWithoutReelInput
    memorys?: MemoryUncheckedCreateNestedManyWithoutReelInput
    relationships?: RelationshipUncheckedCreateNestedManyWithoutReelsInput
  }

  export type ReelCreateOrConnectWithoutChildhoodInput = {
    where: ReelWhereUniqueInput
    create: XOR<ReelCreateWithoutChildhoodInput, ReelUncheckedCreateWithoutChildhoodInput>
  }

  export type RelationshipCreateWithoutWheelTexturesInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    relation: string
    comment?: string | null
    reels?: ReelCreateNestedOneWithoutRelationshipsInput
  }

  export type RelationshipUncheckedCreateWithoutWheelTexturesInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    relation: string
    comment?: string | null
    reelId?: number | null
  }

  export type RelationshipCreateOrConnectWithoutWheelTexturesInput = {
    where: RelationshipWhereUniqueInput
    create: XOR<RelationshipCreateWithoutWheelTexturesInput, RelationshipUncheckedCreateWithoutWheelTexturesInput>
  }

  export type MemoryUpsertWithoutWheelTexturesInput = {
    update: XOR<MemoryUpdateWithoutWheelTexturesInput, MemoryUncheckedUpdateWithoutWheelTexturesInput>
    create: XOR<MemoryCreateWithoutWheelTexturesInput, MemoryUncheckedCreateWithoutWheelTexturesInput>
    where?: MemoryWhereInput
  }

  export type MemoryUpdateToOneWithWhereWithoutWheelTexturesInput = {
    where?: MemoryWhereInput
    data: XOR<MemoryUpdateWithoutWheelTexturesInput, MemoryUncheckedUpdateWithoutWheelTexturesInput>
  }

  export type MemoryUpdateWithoutWheelTexturesInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    subTitle?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reel?: ReelUpdateOneRequiredWithoutMemorysNestedInput
  }

  export type MemoryUncheckedUpdateWithoutWheelTexturesInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    subTitle?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: IntFieldUpdateOperationsInput | number
  }

  export type ReelUpsertWithoutChildhoodInput = {
    update: XOR<ReelUpdateWithoutChildhoodInput, ReelUncheckedUpdateWithoutChildhoodInput>
    create: XOR<ReelCreateWithoutChildhoodInput, ReelUncheckedCreateWithoutChildhoodInput>
    where?: ReelWhereInput
  }

  export type ReelUpdateToOneWithWhereWithoutChildhoodInput = {
    where?: ReelWhereInput
    data: XOR<ReelUpdateWithoutChildhoodInput, ReelUncheckedUpdateWithoutChildhoodInput>
  }

  export type ReelUpdateWithoutChildhoodInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUpdateOneWithoutReelNestedInput
    memorys?: MemoryUpdateManyWithoutReelNestedInput
    user?: UserUpdateOneWithoutReelsNestedInput
    relationships?: RelationshipUpdateManyWithoutReelsNestedInput
  }

  export type ReelUncheckedUpdateWithoutChildhoodInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUncheckedUpdateOneWithoutReelNestedInput
    memorys?: MemoryUncheckedUpdateManyWithoutReelNestedInput
    relationships?: RelationshipUncheckedUpdateManyWithoutReelsNestedInput
  }

  export type RelationshipUpsertWithoutWheelTexturesInput = {
    update: XOR<RelationshipUpdateWithoutWheelTexturesInput, RelationshipUncheckedUpdateWithoutWheelTexturesInput>
    create: XOR<RelationshipCreateWithoutWheelTexturesInput, RelationshipUncheckedCreateWithoutWheelTexturesInput>
    where?: RelationshipWhereInput
  }

  export type RelationshipUpdateToOneWithWhereWithoutWheelTexturesInput = {
    where?: RelationshipWhereInput
    data: XOR<RelationshipUpdateWithoutWheelTexturesInput, RelationshipUncheckedUpdateWithoutWheelTexturesInput>
  }

  export type RelationshipUpdateWithoutWheelTexturesInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reels?: ReelUpdateOneWithoutRelationshipsNestedInput
  }

  export type RelationshipUncheckedUpdateWithoutWheelTexturesInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ReelCreateWithoutMemorysInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    lifestory?: LifestoryCreateNestedOneWithoutReelInput
    user?: UserCreateNestedOneWithoutReelsInput
    relationships?: RelationshipCreateNestedManyWithoutReelsInput
    childhood?: WheelTextureCreateNestedManyWithoutReelsInput
  }

  export type ReelUncheckedCreateWithoutMemorysInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    userId?: number | null
    lifestory?: LifestoryUncheckedCreateNestedOneWithoutReelInput
    relationships?: RelationshipUncheckedCreateNestedManyWithoutReelsInput
    childhood?: WheelTextureUncheckedCreateNestedManyWithoutReelsInput
  }

  export type ReelCreateOrConnectWithoutMemorysInput = {
    where: ReelWhereUniqueInput
    create: XOR<ReelCreateWithoutMemorysInput, ReelUncheckedCreateWithoutMemorysInput>
  }

  export type WheelTextureCreateWithoutMemoryInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    caption?: string | null
    reels?: ReelCreateNestedOneWithoutChildhoodInput
    relationship?: RelationshipCreateNestedOneWithoutWheelTexturesInput
  }

  export type WheelTextureUncheckedCreateWithoutMemoryInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    relationshipId?: number | null
    caption?: string | null
    reelId?: number | null
  }

  export type WheelTextureCreateOrConnectWithoutMemoryInput = {
    where: WheelTextureWhereUniqueInput
    create: XOR<WheelTextureCreateWithoutMemoryInput, WheelTextureUncheckedCreateWithoutMemoryInput>
  }

  export type WheelTextureCreateManyMemoryInputEnvelope = {
    data: WheelTextureCreateManyMemoryInput | WheelTextureCreateManyMemoryInput[]
    skipDuplicates?: boolean
  }

  export type ReelUpsertWithoutMemorysInput = {
    update: XOR<ReelUpdateWithoutMemorysInput, ReelUncheckedUpdateWithoutMemorysInput>
    create: XOR<ReelCreateWithoutMemorysInput, ReelUncheckedCreateWithoutMemorysInput>
    where?: ReelWhereInput
  }

  export type ReelUpdateToOneWithWhereWithoutMemorysInput = {
    where?: ReelWhereInput
    data: XOR<ReelUpdateWithoutMemorysInput, ReelUncheckedUpdateWithoutMemorysInput>
  }

  export type ReelUpdateWithoutMemorysInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUpdateOneWithoutReelNestedInput
    user?: UserUpdateOneWithoutReelsNestedInput
    relationships?: RelationshipUpdateManyWithoutReelsNestedInput
    childhood?: WheelTextureUpdateManyWithoutReelsNestedInput
  }

  export type ReelUncheckedUpdateWithoutMemorysInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUncheckedUpdateOneWithoutReelNestedInput
    relationships?: RelationshipUncheckedUpdateManyWithoutReelsNestedInput
    childhood?: WheelTextureUncheckedUpdateManyWithoutReelsNestedInput
  }

  export type WheelTextureUpsertWithWhereUniqueWithoutMemoryInput = {
    where: WheelTextureWhereUniqueInput
    update: XOR<WheelTextureUpdateWithoutMemoryInput, WheelTextureUncheckedUpdateWithoutMemoryInput>
    create: XOR<WheelTextureCreateWithoutMemoryInput, WheelTextureUncheckedCreateWithoutMemoryInput>
  }

  export type WheelTextureUpdateWithWhereUniqueWithoutMemoryInput = {
    where: WheelTextureWhereUniqueInput
    data: XOR<WheelTextureUpdateWithoutMemoryInput, WheelTextureUncheckedUpdateWithoutMemoryInput>
  }

  export type WheelTextureUpdateManyWithWhereWithoutMemoryInput = {
    where: WheelTextureScalarWhereInput
    data: XOR<WheelTextureUpdateManyMutationInput, WheelTextureUncheckedUpdateManyWithoutMemoryInput>
  }

  export type ReelCreateWithoutRelationshipsInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    lifestory?: LifestoryCreateNestedOneWithoutReelInput
    memorys?: MemoryCreateNestedManyWithoutReelInput
    user?: UserCreateNestedOneWithoutReelsInput
    childhood?: WheelTextureCreateNestedManyWithoutReelsInput
  }

  export type ReelUncheckedCreateWithoutRelationshipsInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
    userId?: number | null
    lifestory?: LifestoryUncheckedCreateNestedOneWithoutReelInput
    memorys?: MemoryUncheckedCreateNestedManyWithoutReelInput
    childhood?: WheelTextureUncheckedCreateNestedManyWithoutReelsInput
  }

  export type ReelCreateOrConnectWithoutRelationshipsInput = {
    where: ReelWhereUniqueInput
    create: XOR<ReelCreateWithoutRelationshipsInput, ReelUncheckedCreateWithoutRelationshipsInput>
  }

  export type WheelTextureCreateWithoutRelationshipInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    caption?: string | null
    memory?: MemoryCreateNestedOneWithoutWheelTexturesInput
    reels?: ReelCreateNestedOneWithoutChildhoodInput
  }

  export type WheelTextureUncheckedCreateWithoutRelationshipInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    memoryId?: number | null
    caption?: string | null
    reelId?: number | null
  }

  export type WheelTextureCreateOrConnectWithoutRelationshipInput = {
    where: WheelTextureWhereUniqueInput
    create: XOR<WheelTextureCreateWithoutRelationshipInput, WheelTextureUncheckedCreateWithoutRelationshipInput>
  }

  export type WheelTextureCreateManyRelationshipInputEnvelope = {
    data: WheelTextureCreateManyRelationshipInput | WheelTextureCreateManyRelationshipInput[]
    skipDuplicates?: boolean
  }

  export type ReelUpsertWithoutRelationshipsInput = {
    update: XOR<ReelUpdateWithoutRelationshipsInput, ReelUncheckedUpdateWithoutRelationshipsInput>
    create: XOR<ReelCreateWithoutRelationshipsInput, ReelUncheckedCreateWithoutRelationshipsInput>
    where?: ReelWhereInput
  }

  export type ReelUpdateToOneWithWhereWithoutRelationshipsInput = {
    where?: ReelWhereInput
    data: XOR<ReelUpdateWithoutRelationshipsInput, ReelUncheckedUpdateWithoutRelationshipsInput>
  }

  export type ReelUpdateWithoutRelationshipsInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUpdateOneWithoutReelNestedInput
    memorys?: MemoryUpdateManyWithoutReelNestedInput
    user?: UserUpdateOneWithoutReelsNestedInput
    childhood?: WheelTextureUpdateManyWithoutReelsNestedInput
  }

  export type ReelUncheckedUpdateWithoutRelationshipsInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUncheckedUpdateOneWithoutReelNestedInput
    memorys?: MemoryUncheckedUpdateManyWithoutReelNestedInput
    childhood?: WheelTextureUncheckedUpdateManyWithoutReelsNestedInput
  }

  export type WheelTextureUpsertWithWhereUniqueWithoutRelationshipInput = {
    where: WheelTextureWhereUniqueInput
    update: XOR<WheelTextureUpdateWithoutRelationshipInput, WheelTextureUncheckedUpdateWithoutRelationshipInput>
    create: XOR<WheelTextureCreateWithoutRelationshipInput, WheelTextureUncheckedCreateWithoutRelationshipInput>
  }

  export type WheelTextureUpdateWithWhereUniqueWithoutRelationshipInput = {
    where: WheelTextureWhereUniqueInput
    data: XOR<WheelTextureUpdateWithoutRelationshipInput, WheelTextureUncheckedUpdateWithoutRelationshipInput>
  }

  export type WheelTextureUpdateManyWithWhereWithoutRelationshipInput = {
    where: WheelTextureScalarWhereInput
    data: XOR<WheelTextureUpdateManyMutationInput, WheelTextureUncheckedUpdateManyWithoutRelationshipInput>
  }

  export type UserCreateWithoutRecordsInput = {
    name: string
    mobile: string
    plan?: string
    birthDate: string
    email?: string | null
    reels?: ReelCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutRecordsInput = {
    id?: number
    name: string
    mobile: string
    plan?: string
    birthDate: string
    email?: string | null
    reels?: ReelUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutRecordsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRecordsInput, UserUncheckedCreateWithoutRecordsInput>
  }

  export type RecordItemCreateWithoutRecordInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    title?: string | null
    date?: string | null
    location?: string | null
    description?: string | null
    color?: string | null
    isHighlight?: boolean
    coverUrl?: string | null
    images?: RecordItemCreateimagesInput | string[]
  }

  export type RecordItemUncheckedCreateWithoutRecordInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    title?: string | null
    date?: string | null
    location?: string | null
    description?: string | null
    color?: string | null
    isHighlight?: boolean
    coverUrl?: string | null
    images?: RecordItemCreateimagesInput | string[]
  }

  export type RecordItemCreateOrConnectWithoutRecordInput = {
    where: RecordItemWhereUniqueInput
    create: XOR<RecordItemCreateWithoutRecordInput, RecordItemUncheckedCreateWithoutRecordInput>
  }

  export type RecordItemCreateManyRecordInputEnvelope = {
    data: RecordItemCreateManyRecordInput | RecordItemCreateManyRecordInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutRecordsInput = {
    update: XOR<UserUpdateWithoutRecordsInput, UserUncheckedUpdateWithoutRecordsInput>
    create: XOR<UserCreateWithoutRecordsInput, UserUncheckedCreateWithoutRecordsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutRecordsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutRecordsInput, UserUncheckedUpdateWithoutRecordsInput>
  }

  export type UserUpdateWithoutRecordsInput = {
    name?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    reels?: ReelUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutRecordsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    mobile?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    reels?: ReelUncheckedUpdateManyWithoutUserNestedInput
  }

  export type RecordItemUpsertWithWhereUniqueWithoutRecordInput = {
    where: RecordItemWhereUniqueInput
    update: XOR<RecordItemUpdateWithoutRecordInput, RecordItemUncheckedUpdateWithoutRecordInput>
    create: XOR<RecordItemCreateWithoutRecordInput, RecordItemUncheckedCreateWithoutRecordInput>
  }

  export type RecordItemUpdateWithWhereUniqueWithoutRecordInput = {
    where: RecordItemWhereUniqueInput
    data: XOR<RecordItemUpdateWithoutRecordInput, RecordItemUncheckedUpdateWithoutRecordInput>
  }

  export type RecordItemUpdateManyWithWhereWithoutRecordInput = {
    where: RecordItemScalarWhereInput
    data: XOR<RecordItemUpdateManyMutationInput, RecordItemUncheckedUpdateManyWithoutRecordInput>
  }

  export type RecordItemScalarWhereInput = {
    AND?: RecordItemScalarWhereInput | RecordItemScalarWhereInput[]
    OR?: RecordItemScalarWhereInput[]
    NOT?: RecordItemScalarWhereInput | RecordItemScalarWhereInput[]
    id?: IntFilter<"RecordItem"> | number
    createdAt?: DateTimeFilter<"RecordItem"> | Date | string
    updatedAt?: DateTimeFilter<"RecordItem"> | Date | string
    title?: StringNullableFilter<"RecordItem"> | string | null
    date?: StringNullableFilter<"RecordItem"> | string | null
    location?: StringNullableFilter<"RecordItem"> | string | null
    description?: StringNullableFilter<"RecordItem"> | string | null
    color?: StringNullableFilter<"RecordItem"> | string | null
    isHighlight?: BoolFilter<"RecordItem"> | boolean
    coverUrl?: StringNullableFilter<"RecordItem"> | string | null
    images?: StringNullableListFilter<"RecordItem">
    recordId?: IntFilter<"RecordItem"> | number
  }

  export type RecordCreateWithoutRecordItemsInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    coverUrl?: string | null
    name?: string | null
    subName?: string | null
    description?: string | null
    bgm?: string | null
    color?: string | null
    userName?: string | null
    birthDate?: string | null
    displayMode?: string | null
    user?: UserCreateNestedOneWithoutRecordsInput
  }

  export type RecordUncheckedCreateWithoutRecordItemsInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    coverUrl?: string | null
    name?: string | null
    subName?: string | null
    description?: string | null
    bgm?: string | null
    color?: string | null
    userId?: number | null
    userName?: string | null
    birthDate?: string | null
    displayMode?: string | null
  }

  export type RecordCreateOrConnectWithoutRecordItemsInput = {
    where: RecordWhereUniqueInput
    create: XOR<RecordCreateWithoutRecordItemsInput, RecordUncheckedCreateWithoutRecordItemsInput>
  }

  export type RecordUpsertWithoutRecordItemsInput = {
    update: XOR<RecordUpdateWithoutRecordItemsInput, RecordUncheckedUpdateWithoutRecordItemsInput>
    create: XOR<RecordCreateWithoutRecordItemsInput, RecordUncheckedCreateWithoutRecordItemsInput>
    where?: RecordWhereInput
  }

  export type RecordUpdateToOneWithWhereWithoutRecordItemsInput = {
    where?: RecordWhereInput
    data: XOR<RecordUpdateWithoutRecordItemsInput, RecordUncheckedUpdateWithoutRecordItemsInput>
  }

  export type RecordUpdateWithoutRecordItemsInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    subName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    bgm?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableStringFieldUpdateOperationsInput | string | null
    displayMode?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneWithoutRecordsNestedInput
  }

  export type RecordUncheckedUpdateWithoutRecordItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    subName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    bgm?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableStringFieldUpdateOperationsInput | string | null
    displayMode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RecordCreateManyUserInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    coverUrl?: string | null
    name?: string | null
    subName?: string | null
    description?: string | null
    bgm?: string | null
    color?: string | null
    userName?: string | null
    birthDate?: string | null
    displayMode?: string | null
  }

  export type ReelCreateManyUserInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    identifier: string
    name: string
    birthDate: string
    profileImg?: string | null
    birthPlace?: string | null
    motto?: string | null
    lifestoryId?: number | null
  }

  export type RecordUpdateWithoutUserInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    subName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    bgm?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableStringFieldUpdateOperationsInput | string | null
    displayMode?: NullableStringFieldUpdateOperationsInput | string | null
    recordItems?: RecordItemUpdateManyWithoutRecordNestedInput
  }

  export type RecordUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    subName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    bgm?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableStringFieldUpdateOperationsInput | string | null
    displayMode?: NullableStringFieldUpdateOperationsInput | string | null
    recordItems?: RecordItemUncheckedUpdateManyWithoutRecordNestedInput
  }

  export type RecordUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    subName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    bgm?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    birthDate?: NullableStringFieldUpdateOperationsInput | string | null
    displayMode?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReelUpdateWithoutUserInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUpdateOneWithoutReelNestedInput
    memorys?: MemoryUpdateManyWithoutReelNestedInput
    relationships?: RelationshipUpdateManyWithoutReelsNestedInput
    childhood?: WheelTextureUpdateManyWithoutReelsNestedInput
  }

  export type ReelUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
    lifestory?: LifestoryUncheckedUpdateOneWithoutReelNestedInput
    memorys?: MemoryUncheckedUpdateManyWithoutReelNestedInput
    relationships?: RelationshipUncheckedUpdateManyWithoutReelsNestedInput
    childhood?: WheelTextureUncheckedUpdateManyWithoutReelsNestedInput
  }

  export type ReelUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    identifier?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    birthDate?: StringFieldUpdateOperationsInput | string
    profileImg?: NullableStringFieldUpdateOperationsInput | string | null
    birthPlace?: NullableStringFieldUpdateOperationsInput | string | null
    motto?: NullableStringFieldUpdateOperationsInput | string | null
    lifestoryId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type MemoryCreateManyReelInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    subTitle?: string | null
    date?: Date | string | null
    comment?: string | null
  }

  export type RelationshipCreateManyReelsInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    relation: string
    comment?: string | null
  }

  export type WheelTextureCreateManyReelsInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    memoryId?: number | null
    relationshipId?: number | null
    caption?: string | null
  }

  export type MemoryUpdateWithoutReelInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    subTitle?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    wheelTextures?: WheelTextureUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryUncheckedUpdateWithoutReelInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    subTitle?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    wheelTextures?: WheelTextureUncheckedUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryUncheckedUpdateManyWithoutReelInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    subTitle?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RelationshipUpdateWithoutReelsInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    wheelTextures?: WheelTextureUpdateManyWithoutRelationshipNestedInput
  }

  export type RelationshipUncheckedUpdateWithoutReelsInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    wheelTextures?: WheelTextureUncheckedUpdateManyWithoutRelationshipNestedInput
  }

  export type RelationshipUncheckedUpdateManyWithoutReelsInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    relation?: StringFieldUpdateOperationsInput | string
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WheelTextureUpdateWithoutReelsInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    memory?: MemoryUpdateOneWithoutWheelTexturesNestedInput
    relationship?: RelationshipUpdateOneWithoutWheelTexturesNestedInput
  }

  export type WheelTextureUncheckedUpdateWithoutReelsInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    memoryId?: NullableIntFieldUpdateOperationsInput | number | null
    relationshipId?: NullableIntFieldUpdateOperationsInput | number | null
    caption?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WheelTextureUncheckedUpdateManyWithoutReelsInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    memoryId?: NullableIntFieldUpdateOperationsInput | number | null
    relationshipId?: NullableIntFieldUpdateOperationsInput | number | null
    caption?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WheelTextureCreateManyMemoryInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    relationshipId?: number | null
    caption?: string | null
    reelId?: number | null
  }

  export type WheelTextureUpdateWithoutMemoryInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    reels?: ReelUpdateOneWithoutChildhoodNestedInput
    relationship?: RelationshipUpdateOneWithoutWheelTexturesNestedInput
  }

  export type WheelTextureUncheckedUpdateWithoutMemoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    relationshipId?: NullableIntFieldUpdateOperationsInput | number | null
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type WheelTextureUncheckedUpdateManyWithoutMemoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    relationshipId?: NullableIntFieldUpdateOperationsInput | number | null
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type WheelTextureCreateManyRelationshipInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    srcType: number
    srcUrl: string
    memoryId?: number | null
    caption?: string | null
    reelId?: number | null
  }

  export type WheelTextureUpdateWithoutRelationshipInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    memory?: MemoryUpdateOneWithoutWheelTexturesNestedInput
    reels?: ReelUpdateOneWithoutChildhoodNestedInput
  }

  export type WheelTextureUncheckedUpdateWithoutRelationshipInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    memoryId?: NullableIntFieldUpdateOperationsInput | number | null
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type WheelTextureUncheckedUpdateManyWithoutRelationshipInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    srcType?: IntFieldUpdateOperationsInput | number
    srcUrl?: StringFieldUpdateOperationsInput | string
    memoryId?: NullableIntFieldUpdateOperationsInput | number | null
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    reelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type RecordItemCreateManyRecordInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    title?: string | null
    date?: string | null
    location?: string | null
    description?: string | null
    color?: string | null
    isHighlight?: boolean
    coverUrl?: string | null
    images?: RecordItemCreateimagesInput | string[]
  }

  export type RecordItemUpdateWithoutRecordInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    images?: RecordItemUpdateimagesInput | string[]
  }

  export type RecordItemUncheckedUpdateWithoutRecordInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    images?: RecordItemUpdateimagesInput | string[]
  }

  export type RecordItemUncheckedUpdateManyWithoutRecordInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    date?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    coverUrl?: NullableStringFieldUpdateOperationsInput | string | null
    images?: RecordItemUpdateimagesInput | string[]
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}