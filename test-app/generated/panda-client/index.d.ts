
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
 * Model Organization
 * 
 */
export type Organization = $Result.DefaultSelection<Prisma.$OrganizationPayload>
/**
 * Model OrganizationSettings
 * 
 */
export type OrganizationSettings = $Result.DefaultSelection<Prisma.$OrganizationSettingsPayload>
/**
 * Model OrganizationRole
 * 
 */
export type OrganizationRole = $Result.DefaultSelection<Prisma.$OrganizationRolePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Organizations
 * const organizations = await prisma.organization.findMany()
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
   * // Fetch zero or more Organizations
   * const organizations = await prisma.organization.findMany()
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
   * `prisma.organization`: Exposes CRUD operations for the **Organization** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organizations
    * const organizations = await prisma.organization.findMany()
    * ```
    */
  get organization(): Prisma.OrganizationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.organizationSettings`: Exposes CRUD operations for the **OrganizationSettings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrganizationSettings
    * const organizationSettings = await prisma.organizationSettings.findMany()
    * ```
    */
  get organizationSettings(): Prisma.OrganizationSettingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.organizationRole`: Exposes CRUD operations for the **OrganizationRole** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrganizationRoles
    * const organizationRoles = await prisma.organizationRole.findMany()
    * ```
    */
  get organizationRole(): Prisma.OrganizationRoleDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.18.0
   * Query Engine version: 34b5a692b7bd79939a9a2c3ef97d816e749cda2f
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
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
    Organization: 'Organization',
    OrganizationSettings: 'OrganizationSettings',
    OrganizationRole: 'OrganizationRole'
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
      modelProps: "organization" | "organizationSettings" | "organizationRole"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Organization: {
        payload: Prisma.$OrganizationPayload<ExtArgs>
        fields: Prisma.OrganizationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findFirst: {
            args: Prisma.OrganizationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findMany: {
            args: Prisma.OrganizationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          create: {
            args: Prisma.OrganizationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          createMany: {
            args: Prisma.OrganizationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          delete: {
            args: Prisma.OrganizationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          update: {
            args: Prisma.OrganizationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          deleteMany: {
            args: Prisma.OrganizationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          upsert: {
            args: Prisma.OrganizationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          aggregate: {
            args: Prisma.OrganizationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganization>
          }
          groupBy: {
            args: Prisma.OrganizationGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationCountAggregateOutputType> | number
          }
        }
      }
      OrganizationSettings: {
        payload: Prisma.$OrganizationSettingsPayload<ExtArgs>
        fields: Prisma.OrganizationSettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationSettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationSettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload>
          }
          findFirst: {
            args: Prisma.OrganizationSettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationSettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload>
          }
          findMany: {
            args: Prisma.OrganizationSettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload>[]
          }
          create: {
            args: Prisma.OrganizationSettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload>
          }
          createMany: {
            args: Prisma.OrganizationSettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationSettingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload>[]
          }
          delete: {
            args: Prisma.OrganizationSettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload>
          }
          update: {
            args: Prisma.OrganizationSettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload>
          }
          deleteMany: {
            args: Prisma.OrganizationSettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationSettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationSettingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload>[]
          }
          upsert: {
            args: Prisma.OrganizationSettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationSettingsPayload>
          }
          aggregate: {
            args: Prisma.OrganizationSettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganizationSettings>
          }
          groupBy: {
            args: Prisma.OrganizationSettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationSettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationSettingsCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationSettingsCountAggregateOutputType> | number
          }
        }
      }
      OrganizationRole: {
        payload: Prisma.$OrganizationRolePayload<ExtArgs>
        fields: Prisma.OrganizationRoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationRoleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationRoleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload>
          }
          findFirst: {
            args: Prisma.OrganizationRoleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationRoleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload>
          }
          findMany: {
            args: Prisma.OrganizationRoleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload>[]
          }
          create: {
            args: Prisma.OrganizationRoleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload>
          }
          createMany: {
            args: Prisma.OrganizationRoleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationRoleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload>[]
          }
          delete: {
            args: Prisma.OrganizationRoleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload>
          }
          update: {
            args: Prisma.OrganizationRoleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload>
          }
          deleteMany: {
            args: Prisma.OrganizationRoleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationRoleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationRoleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload>[]
          }
          upsert: {
            args: Prisma.OrganizationRoleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationRolePayload>
          }
          aggregate: {
            args: Prisma.OrganizationRoleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganizationRole>
          }
          groupBy: {
            args: Prisma.OrganizationRoleGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationRoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationRoleCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationRoleCountAggregateOutputType> | number
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
    organization?: OrganizationOmit
    organizationSettings?: OrganizationSettingsOmit
    organizationRole?: OrganizationRoleOmit
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
   * Count Type OrganizationCountOutputType
   */

  export type OrganizationCountOutputType = {
    roles: number
  }

  export type OrganizationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    roles?: boolean | OrganizationCountOutputTypeCountRolesArgs
  }

  // Custom InputTypes
  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationCountOutputType
     */
    select?: OrganizationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationRoleWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Organization
   */

  export type AggregateOrganization = {
    _count: OrganizationCountAggregateOutputType | null
    _avg: OrganizationAvgAggregateOutputType | null
    _sum: OrganizationSumAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  export type OrganizationAvgAggregateOutputType = {
    keyVersion: number | null
  }

  export type OrganizationSumAggregateOutputType = {
    keyVersion: number | null
  }

  export type OrganizationMinAggregateOutputType = {
    id: string | null
    subdomain: string | null
    name: string | null
    address: string | null
    phone: string | null
    email: string | null
    active: boolean | null
    encryptionKey: string | null
    keyVersion: number | null
    keyRotatedAt: Date | null
    subscriptionPlan: string | null
    subscriptionStatus: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationMaxAggregateOutputType = {
    id: string | null
    subdomain: string | null
    name: string | null
    address: string | null
    phone: string | null
    email: string | null
    active: boolean | null
    encryptionKey: string | null
    keyVersion: number | null
    keyRotatedAt: Date | null
    subscriptionPlan: string | null
    subscriptionStatus: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationCountAggregateOutputType = {
    id: number
    subdomain: number
    name: number
    address: number
    phone: number
    email: number
    active: number
    encryptionKey: number
    keyVersion: number
    keyRotatedAt: number
    subscriptionPlan: number
    subscriptionStatus: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrganizationAvgAggregateInputType = {
    keyVersion?: true
  }

  export type OrganizationSumAggregateInputType = {
    keyVersion?: true
  }

  export type OrganizationMinAggregateInputType = {
    id?: true
    subdomain?: true
    name?: true
    address?: true
    phone?: true
    email?: true
    active?: true
    encryptionKey?: true
    keyVersion?: true
    keyRotatedAt?: true
    subscriptionPlan?: true
    subscriptionStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationMaxAggregateInputType = {
    id?: true
    subdomain?: true
    name?: true
    address?: true
    phone?: true
    email?: true
    active?: true
    encryptionKey?: true
    keyVersion?: true
    keyRotatedAt?: true
    subscriptionPlan?: true
    subscriptionStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationCountAggregateInputType = {
    id?: true
    subdomain?: true
    name?: true
    address?: true
    phone?: true
    email?: true
    active?: true
    encryptionKey?: true
    keyVersion?: true
    keyRotatedAt?: true
    subscriptionPlan?: true
    subscriptionStatus?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrganizationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organization to aggregate.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Organizations
    **/
    _count?: true | OrganizationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrganizationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrganizationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationMaxAggregateInputType
  }

  export type GetOrganizationAggregateType<T extends OrganizationAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganization]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganization[P]>
      : GetScalarType<T[P], AggregateOrganization[P]>
  }




  export type OrganizationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationWhereInput
    orderBy?: OrganizationOrderByWithAggregationInput | OrganizationOrderByWithAggregationInput[]
    by: OrganizationScalarFieldEnum[] | OrganizationScalarFieldEnum
    having?: OrganizationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationCountAggregateInputType | true
    _avg?: OrganizationAvgAggregateInputType
    _sum?: OrganizationSumAggregateInputType
    _min?: OrganizationMinAggregateInputType
    _max?: OrganizationMaxAggregateInputType
  }

  export type OrganizationGroupByOutputType = {
    id: string
    subdomain: string
    name: string
    address: string | null
    phone: string | null
    email: string | null
    active: boolean
    encryptionKey: string
    keyVersion: number
    keyRotatedAt: Date
    subscriptionPlan: string
    subscriptionStatus: string
    createdAt: Date
    updatedAt: Date
    _count: OrganizationCountAggregateOutputType | null
    _avg: OrganizationAvgAggregateOutputType | null
    _sum: OrganizationSumAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  type GetOrganizationGroupByPayload<T extends OrganizationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    subdomain?: boolean
    name?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    active?: boolean
    encryptionKey?: boolean
    keyVersion?: boolean
    keyRotatedAt?: boolean
    subscriptionPlan?: boolean
    subscriptionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    settings?: boolean | Organization$settingsArgs<ExtArgs>
    roles?: boolean | Organization$rolesArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    subdomain?: boolean
    name?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    active?: boolean
    encryptionKey?: boolean
    keyVersion?: boolean
    keyRotatedAt?: boolean
    subscriptionPlan?: boolean
    subscriptionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    subdomain?: boolean
    name?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    active?: boolean
    encryptionKey?: boolean
    keyVersion?: boolean
    keyRotatedAt?: boolean
    subscriptionPlan?: boolean
    subscriptionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectScalar = {
    id?: boolean
    subdomain?: boolean
    name?: boolean
    address?: boolean
    phone?: boolean
    email?: boolean
    active?: boolean
    encryptionKey?: boolean
    keyVersion?: boolean
    keyRotatedAt?: boolean
    subscriptionPlan?: boolean
    subscriptionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrganizationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "subdomain" | "name" | "address" | "phone" | "email" | "active" | "encryptionKey" | "keyVersion" | "keyRotatedAt" | "subscriptionPlan" | "subscriptionStatus" | "createdAt" | "updatedAt", ExtArgs["result"]["organization"]>
  export type OrganizationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    settings?: boolean | Organization$settingsArgs<ExtArgs>
    roles?: boolean | Organization$rolesArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrganizationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OrganizationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OrganizationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Organization"
    objects: {
      settings: Prisma.$OrganizationSettingsPayload<ExtArgs> | null
      roles: Prisma.$OrganizationRolePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      subdomain: string
      name: string
      address: string | null
      phone: string | null
      email: string | null
      active: boolean
      encryptionKey: string
      keyVersion: number
      keyRotatedAt: Date
      subscriptionPlan: string
      subscriptionStatus: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["organization"]>
    composites: {}
  }

  type OrganizationGetPayload<S extends boolean | null | undefined | OrganizationDefaultArgs> = $Result.GetResult<Prisma.$OrganizationPayload, S>

  type OrganizationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationCountAggregateInputType | true
    }

  export interface OrganizationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Organization'], meta: { name: 'Organization' } }
    /**
     * Find zero or one Organization that matches the filter.
     * @param {OrganizationFindUniqueArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationFindUniqueArgs>(args: SelectSubset<T, OrganizationFindUniqueArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organization that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationFindUniqueOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationFindFirstArgs>(args?: SelectSubset<T, OrganizationFindFirstArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organizations
     * const organizations = await prisma.organization.findMany()
     * 
     * // Get first 10 Organizations
     * const organizations = await prisma.organization.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationWithIdOnly = await prisma.organization.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationFindManyArgs>(args?: SelectSubset<T, OrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organization.
     * @param {OrganizationCreateArgs} args - Arguments to create a Organization.
     * @example
     * // Create one Organization
     * const Organization = await prisma.organization.create({
     *   data: {
     *     // ... data to create a Organization
     *   }
     * })
     * 
     */
    create<T extends OrganizationCreateArgs>(args: SelectSubset<T, OrganizationCreateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organizations.
     * @param {OrganizationCreateManyArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationCreateManyArgs>(args?: SelectSubset<T, OrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Organizations and returns the data saved in the database.
     * @param {OrganizationCreateManyAndReturnArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganizationCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Organization.
     * @param {OrganizationDeleteArgs} args - Arguments to delete one Organization.
     * @example
     * // Delete one Organization
     * const Organization = await prisma.organization.delete({
     *   where: {
     *     // ... filter to delete one Organization
     *   }
     * })
     * 
     */
    delete<T extends OrganizationDeleteArgs>(args: SelectSubset<T, OrganizationDeleteArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organization.
     * @param {OrganizationUpdateArgs} args - Arguments to update one Organization.
     * @example
     * // Update one Organization
     * const organization = await prisma.organization.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationUpdateArgs>(args: SelectSubset<T, OrganizationUpdateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organizations.
     * @param {OrganizationDeleteManyArgs} args - Arguments to filter Organizations to delete.
     * @example
     * // Delete a few Organizations
     * const { count } = await prisma.organization.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationDeleteManyArgs>(args?: SelectSubset<T, OrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationUpdateManyArgs>(args: SelectSubset<T, OrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations and returns the data updated in the database.
     * @param {OrganizationUpdateManyAndReturnArgs} args - Arguments to update many Organizations.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.updateManyAndReturn({
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
    updateManyAndReturn<T extends OrganizationUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Organization.
     * @param {OrganizationUpsertArgs} args - Arguments to update or create a Organization.
     * @example
     * // Update or create a Organization
     * const organization = await prisma.organization.upsert({
     *   create: {
     *     // ... data to create a Organization
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organization we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationUpsertArgs>(args: SelectSubset<T, OrganizationUpsertArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationCountArgs} args - Arguments to filter Organizations to count.
     * @example
     * // Count the number of Organizations
     * const count = await prisma.organization.count({
     *   where: {
     *     // ... the filter for the Organizations we want to count
     *   }
     * })
    **/
    count<T extends OrganizationCountArgs>(
      args?: Subset<T, OrganizationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrganizationAggregateArgs>(args: Subset<T, OrganizationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationAggregateType<T>>

    /**
     * Group by Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationGroupByArgs} args - Group by arguments.
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
      T extends OrganizationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Organization model
   */
  readonly fields: OrganizationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Organization.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    settings<T extends Organization$settingsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$settingsArgs<ExtArgs>>): Prisma__OrganizationSettingsClient<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    roles<T extends Organization$rolesArgs<ExtArgs> = {}>(args?: Subset<T, Organization$rolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Organization model
   */
  interface OrganizationFieldRefs {
    readonly id: FieldRef<"Organization", 'String'>
    readonly subdomain: FieldRef<"Organization", 'String'>
    readonly name: FieldRef<"Organization", 'String'>
    readonly address: FieldRef<"Organization", 'String'>
    readonly phone: FieldRef<"Organization", 'String'>
    readonly email: FieldRef<"Organization", 'String'>
    readonly active: FieldRef<"Organization", 'Boolean'>
    readonly encryptionKey: FieldRef<"Organization", 'String'>
    readonly keyVersion: FieldRef<"Organization", 'Int'>
    readonly keyRotatedAt: FieldRef<"Organization", 'DateTime'>
    readonly subscriptionPlan: FieldRef<"Organization", 'String'>
    readonly subscriptionStatus: FieldRef<"Organization", 'String'>
    readonly createdAt: FieldRef<"Organization", 'DateTime'>
    readonly updatedAt: FieldRef<"Organization", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Organization findUnique
   */
  export type OrganizationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findUniqueOrThrow
   */
  export type OrganizationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findFirst
   */
  export type OrganizationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findFirstOrThrow
   */
  export type OrganizationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findMany
   */
  export type OrganizationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organizations to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization create
   */
  export type OrganizationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to create a Organization.
     */
    data: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
  }

  /**
   * Organization createMany
   */
  export type OrganizationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization createManyAndReturn
   */
  export type OrganizationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization update
   */
  export type OrganizationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to update a Organization.
     */
    data: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
    /**
     * Choose, which Organization to update.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization updateMany
   */
  export type OrganizationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization updateManyAndReturn
   */
  export type OrganizationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization upsert
   */
  export type OrganizationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The filter to search for the Organization to update in case it exists.
     */
    where: OrganizationWhereUniqueInput
    /**
     * In case the Organization found by the `where` argument doesn't exist, create a new Organization with this data.
     */
    create: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
    /**
     * In case the Organization was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
  }

  /**
   * Organization delete
   */
  export type OrganizationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter which Organization to delete.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization deleteMany
   */
  export type OrganizationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organizations to delete
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to delete.
     */
    limit?: number
  }

  /**
   * Organization.settings
   */
  export type Organization$settingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    where?: OrganizationSettingsWhereInput
  }

  /**
   * Organization.roles
   */
  export type Organization$rolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    where?: OrganizationRoleWhereInput
    orderBy?: OrganizationRoleOrderByWithRelationInput | OrganizationRoleOrderByWithRelationInput[]
    cursor?: OrganizationRoleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrganizationRoleScalarFieldEnum | OrganizationRoleScalarFieldEnum[]
  }

  /**
   * Organization without action
   */
  export type OrganizationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
  }


  /**
   * Model OrganizationSettings
   */

  export type AggregateOrganizationSettings = {
    _count: OrganizationSettingsCountAggregateOutputType | null
    _min: OrganizationSettingsMinAggregateOutputType | null
    _max: OrganizationSettingsMaxAggregateOutputType | null
  }

  export type OrganizationSettingsMinAggregateOutputType = {
    id: string | null
    timezone: string | null
    locale: string | null
    createdAt: Date | null
    updatedAt: Date | null
    organizationId: string | null
  }

  export type OrganizationSettingsMaxAggregateOutputType = {
    id: string | null
    timezone: string | null
    locale: string | null
    createdAt: Date | null
    updatedAt: Date | null
    organizationId: string | null
  }

  export type OrganizationSettingsCountAggregateOutputType = {
    id: number
    timezone: number
    locale: number
    customSettings: number
    createdAt: number
    updatedAt: number
    organizationId: number
    _all: number
  }


  export type OrganizationSettingsMinAggregateInputType = {
    id?: true
    timezone?: true
    locale?: true
    createdAt?: true
    updatedAt?: true
    organizationId?: true
  }

  export type OrganizationSettingsMaxAggregateInputType = {
    id?: true
    timezone?: true
    locale?: true
    createdAt?: true
    updatedAt?: true
    organizationId?: true
  }

  export type OrganizationSettingsCountAggregateInputType = {
    id?: true
    timezone?: true
    locale?: true
    customSettings?: true
    createdAt?: true
    updatedAt?: true
    organizationId?: true
    _all?: true
  }

  export type OrganizationSettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrganizationSettings to aggregate.
     */
    where?: OrganizationSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationSettings to fetch.
     */
    orderBy?: OrganizationSettingsOrderByWithRelationInput | OrganizationSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrganizationSettings
    **/
    _count?: true | OrganizationSettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationSettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationSettingsMaxAggregateInputType
  }

  export type GetOrganizationSettingsAggregateType<T extends OrganizationSettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganizationSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganizationSettings[P]>
      : GetScalarType<T[P], AggregateOrganizationSettings[P]>
  }




  export type OrganizationSettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationSettingsWhereInput
    orderBy?: OrganizationSettingsOrderByWithAggregationInput | OrganizationSettingsOrderByWithAggregationInput[]
    by: OrganizationSettingsScalarFieldEnum[] | OrganizationSettingsScalarFieldEnum
    having?: OrganizationSettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationSettingsCountAggregateInputType | true
    _min?: OrganizationSettingsMinAggregateInputType
    _max?: OrganizationSettingsMaxAggregateInputType
  }

  export type OrganizationSettingsGroupByOutputType = {
    id: string
    timezone: string
    locale: string
    customSettings: JsonValue
    createdAt: Date
    updatedAt: Date
    organizationId: string
    _count: OrganizationSettingsCountAggregateOutputType | null
    _min: OrganizationSettingsMinAggregateOutputType | null
    _max: OrganizationSettingsMaxAggregateOutputType | null
  }

  type GetOrganizationSettingsGroupByPayload<T extends OrganizationSettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationSettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationSettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationSettingsGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationSettingsGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationSettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    timezone?: boolean
    locale?: boolean
    customSettings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organizationSettings"]>

  export type OrganizationSettingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    timezone?: boolean
    locale?: boolean
    customSettings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organizationSettings"]>

  export type OrganizationSettingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    timezone?: boolean
    locale?: boolean
    customSettings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organizationSettings"]>

  export type OrganizationSettingsSelectScalar = {
    id?: boolean
    timezone?: boolean
    locale?: boolean
    customSettings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
  }

  export type OrganizationSettingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "timezone" | "locale" | "customSettings" | "createdAt" | "updatedAt" | "organizationId", ExtArgs["result"]["organizationSettings"]>
  export type OrganizationSettingsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type OrganizationSettingsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type OrganizationSettingsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $OrganizationSettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrganizationSettings"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      timezone: string
      locale: string
      customSettings: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
      organizationId: string
    }, ExtArgs["result"]["organizationSettings"]>
    composites: {}
  }

  type OrganizationSettingsGetPayload<S extends boolean | null | undefined | OrganizationSettingsDefaultArgs> = $Result.GetResult<Prisma.$OrganizationSettingsPayload, S>

  type OrganizationSettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationSettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationSettingsCountAggregateInputType | true
    }

  export interface OrganizationSettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrganizationSettings'], meta: { name: 'OrganizationSettings' } }
    /**
     * Find zero or one OrganizationSettings that matches the filter.
     * @param {OrganizationSettingsFindUniqueArgs} args - Arguments to find a OrganizationSettings
     * @example
     * // Get one OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationSettingsFindUniqueArgs>(args: SelectSubset<T, OrganizationSettingsFindUniqueArgs<ExtArgs>>): Prisma__OrganizationSettingsClient<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrganizationSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationSettingsFindUniqueOrThrowArgs} args - Arguments to find a OrganizationSettings
     * @example
     * // Get one OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationSettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationSettingsClient<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrganizationSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationSettingsFindFirstArgs} args - Arguments to find a OrganizationSettings
     * @example
     * // Get one OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationSettingsFindFirstArgs>(args?: SelectSubset<T, OrganizationSettingsFindFirstArgs<ExtArgs>>): Prisma__OrganizationSettingsClient<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrganizationSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationSettingsFindFirstOrThrowArgs} args - Arguments to find a OrganizationSettings
     * @example
     * // Get one OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationSettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationSettingsClient<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrganizationSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.findMany()
     * 
     * // Get first 10 OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationSettingsWithIdOnly = await prisma.organizationSettings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationSettingsFindManyArgs>(args?: SelectSubset<T, OrganizationSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrganizationSettings.
     * @param {OrganizationSettingsCreateArgs} args - Arguments to create a OrganizationSettings.
     * @example
     * // Create one OrganizationSettings
     * const OrganizationSettings = await prisma.organizationSettings.create({
     *   data: {
     *     // ... data to create a OrganizationSettings
     *   }
     * })
     * 
     */
    create<T extends OrganizationSettingsCreateArgs>(args: SelectSubset<T, OrganizationSettingsCreateArgs<ExtArgs>>): Prisma__OrganizationSettingsClient<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrganizationSettings.
     * @param {OrganizationSettingsCreateManyArgs} args - Arguments to create many OrganizationSettings.
     * @example
     * // Create many OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationSettingsCreateManyArgs>(args?: SelectSubset<T, OrganizationSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrganizationSettings and returns the data saved in the database.
     * @param {OrganizationSettingsCreateManyAndReturnArgs} args - Arguments to create many OrganizationSettings.
     * @example
     * // Create many OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrganizationSettings and only return the `id`
     * const organizationSettingsWithIdOnly = await prisma.organizationSettings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganizationSettingsCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationSettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrganizationSettings.
     * @param {OrganizationSettingsDeleteArgs} args - Arguments to delete one OrganizationSettings.
     * @example
     * // Delete one OrganizationSettings
     * const OrganizationSettings = await prisma.organizationSettings.delete({
     *   where: {
     *     // ... filter to delete one OrganizationSettings
     *   }
     * })
     * 
     */
    delete<T extends OrganizationSettingsDeleteArgs>(args: SelectSubset<T, OrganizationSettingsDeleteArgs<ExtArgs>>): Prisma__OrganizationSettingsClient<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrganizationSettings.
     * @param {OrganizationSettingsUpdateArgs} args - Arguments to update one OrganizationSettings.
     * @example
     * // Update one OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationSettingsUpdateArgs>(args: SelectSubset<T, OrganizationSettingsUpdateArgs<ExtArgs>>): Prisma__OrganizationSettingsClient<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrganizationSettings.
     * @param {OrganizationSettingsDeleteManyArgs} args - Arguments to filter OrganizationSettings to delete.
     * @example
     * // Delete a few OrganizationSettings
     * const { count } = await prisma.organizationSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationSettingsDeleteManyArgs>(args?: SelectSubset<T, OrganizationSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrganizationSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationSettingsUpdateManyArgs>(args: SelectSubset<T, OrganizationSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrganizationSettings and returns the data updated in the database.
     * @param {OrganizationSettingsUpdateManyAndReturnArgs} args - Arguments to update many OrganizationSettings.
     * @example
     * // Update many OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrganizationSettings and only return the `id`
     * const organizationSettingsWithIdOnly = await prisma.organizationSettings.updateManyAndReturn({
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
    updateManyAndReturn<T extends OrganizationSettingsUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationSettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrganizationSettings.
     * @param {OrganizationSettingsUpsertArgs} args - Arguments to update or create a OrganizationSettings.
     * @example
     * // Update or create a OrganizationSettings
     * const organizationSettings = await prisma.organizationSettings.upsert({
     *   create: {
     *     // ... data to create a OrganizationSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrganizationSettings we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationSettingsUpsertArgs>(args: SelectSubset<T, OrganizationSettingsUpsertArgs<ExtArgs>>): Prisma__OrganizationSettingsClient<$Result.GetResult<Prisma.$OrganizationSettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrganizationSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationSettingsCountArgs} args - Arguments to filter OrganizationSettings to count.
     * @example
     * // Count the number of OrganizationSettings
     * const count = await prisma.organizationSettings.count({
     *   where: {
     *     // ... the filter for the OrganizationSettings we want to count
     *   }
     * })
    **/
    count<T extends OrganizationSettingsCountArgs>(
      args?: Subset<T, OrganizationSettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationSettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrganizationSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrganizationSettingsAggregateArgs>(args: Subset<T, OrganizationSettingsAggregateArgs>): Prisma.PrismaPromise<GetOrganizationSettingsAggregateType<T>>

    /**
     * Group by OrganizationSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationSettingsGroupByArgs} args - Group by arguments.
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
      T extends OrganizationSettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationSettingsGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationSettingsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrganizationSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrganizationSettings model
   */
  readonly fields: OrganizationSettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrganizationSettings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationSettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the OrganizationSettings model
   */
  interface OrganizationSettingsFieldRefs {
    readonly id: FieldRef<"OrganizationSettings", 'String'>
    readonly timezone: FieldRef<"OrganizationSettings", 'String'>
    readonly locale: FieldRef<"OrganizationSettings", 'String'>
    readonly customSettings: FieldRef<"OrganizationSettings", 'Json'>
    readonly createdAt: FieldRef<"OrganizationSettings", 'DateTime'>
    readonly updatedAt: FieldRef<"OrganizationSettings", 'DateTime'>
    readonly organizationId: FieldRef<"OrganizationSettings", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OrganizationSettings findUnique
   */
  export type OrganizationSettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationSettings to fetch.
     */
    where: OrganizationSettingsWhereUniqueInput
  }

  /**
   * OrganizationSettings findUniqueOrThrow
   */
  export type OrganizationSettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationSettings to fetch.
     */
    where: OrganizationSettingsWhereUniqueInput
  }

  /**
   * OrganizationSettings findFirst
   */
  export type OrganizationSettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationSettings to fetch.
     */
    where?: OrganizationSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationSettings to fetch.
     */
    orderBy?: OrganizationSettingsOrderByWithRelationInput | OrganizationSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrganizationSettings.
     */
    cursor?: OrganizationSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrganizationSettings.
     */
    distinct?: OrganizationSettingsScalarFieldEnum | OrganizationSettingsScalarFieldEnum[]
  }

  /**
   * OrganizationSettings findFirstOrThrow
   */
  export type OrganizationSettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationSettings to fetch.
     */
    where?: OrganizationSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationSettings to fetch.
     */
    orderBy?: OrganizationSettingsOrderByWithRelationInput | OrganizationSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrganizationSettings.
     */
    cursor?: OrganizationSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrganizationSettings.
     */
    distinct?: OrganizationSettingsScalarFieldEnum | OrganizationSettingsScalarFieldEnum[]
  }

  /**
   * OrganizationSettings findMany
   */
  export type OrganizationSettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationSettings to fetch.
     */
    where?: OrganizationSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationSettings to fetch.
     */
    orderBy?: OrganizationSettingsOrderByWithRelationInput | OrganizationSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrganizationSettings.
     */
    cursor?: OrganizationSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationSettings.
     */
    skip?: number
    distinct?: OrganizationSettingsScalarFieldEnum | OrganizationSettingsScalarFieldEnum[]
  }

  /**
   * OrganizationSettings create
   */
  export type OrganizationSettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    /**
     * The data needed to create a OrganizationSettings.
     */
    data: XOR<OrganizationSettingsCreateInput, OrganizationSettingsUncheckedCreateInput>
  }

  /**
   * OrganizationSettings createMany
   */
  export type OrganizationSettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrganizationSettings.
     */
    data: OrganizationSettingsCreateManyInput | OrganizationSettingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrganizationSettings createManyAndReturn
   */
  export type OrganizationSettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * The data used to create many OrganizationSettings.
     */
    data: OrganizationSettingsCreateManyInput | OrganizationSettingsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrganizationSettings update
   */
  export type OrganizationSettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    /**
     * The data needed to update a OrganizationSettings.
     */
    data: XOR<OrganizationSettingsUpdateInput, OrganizationSettingsUncheckedUpdateInput>
    /**
     * Choose, which OrganizationSettings to update.
     */
    where: OrganizationSettingsWhereUniqueInput
  }

  /**
   * OrganizationSettings updateMany
   */
  export type OrganizationSettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrganizationSettings.
     */
    data: XOR<OrganizationSettingsUpdateManyMutationInput, OrganizationSettingsUncheckedUpdateManyInput>
    /**
     * Filter which OrganizationSettings to update
     */
    where?: OrganizationSettingsWhereInput
    /**
     * Limit how many OrganizationSettings to update.
     */
    limit?: number
  }

  /**
   * OrganizationSettings updateManyAndReturn
   */
  export type OrganizationSettingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * The data used to update OrganizationSettings.
     */
    data: XOR<OrganizationSettingsUpdateManyMutationInput, OrganizationSettingsUncheckedUpdateManyInput>
    /**
     * Filter which OrganizationSettings to update
     */
    where?: OrganizationSettingsWhereInput
    /**
     * Limit how many OrganizationSettings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrganizationSettings upsert
   */
  export type OrganizationSettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    /**
     * The filter to search for the OrganizationSettings to update in case it exists.
     */
    where: OrganizationSettingsWhereUniqueInput
    /**
     * In case the OrganizationSettings found by the `where` argument doesn't exist, create a new OrganizationSettings with this data.
     */
    create: XOR<OrganizationSettingsCreateInput, OrganizationSettingsUncheckedCreateInput>
    /**
     * In case the OrganizationSettings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationSettingsUpdateInput, OrganizationSettingsUncheckedUpdateInput>
  }

  /**
   * OrganizationSettings delete
   */
  export type OrganizationSettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
    /**
     * Filter which OrganizationSettings to delete.
     */
    where: OrganizationSettingsWhereUniqueInput
  }

  /**
   * OrganizationSettings deleteMany
   */
  export type OrganizationSettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrganizationSettings to delete
     */
    where?: OrganizationSettingsWhereInput
    /**
     * Limit how many OrganizationSettings to delete.
     */
    limit?: number
  }

  /**
   * OrganizationSettings without action
   */
  export type OrganizationSettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationSettings
     */
    select?: OrganizationSettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationSettings
     */
    omit?: OrganizationSettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationSettingsInclude<ExtArgs> | null
  }


  /**
   * Model OrganizationRole
   */

  export type AggregateOrganizationRole = {
    _count: OrganizationRoleCountAggregateOutputType | null
    _avg: OrganizationRoleAvgAggregateOutputType | null
    _sum: OrganizationRoleSumAggregateOutputType | null
    _min: OrganizationRoleMinAggregateOutputType | null
    _max: OrganizationRoleMaxAggregateOutputType | null
  }

  export type OrganizationRoleAvgAggregateOutputType = {
    priority: number | null
  }

  export type OrganizationRoleSumAggregateOutputType = {
    priority: number | null
  }

  export type OrganizationRoleMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    isSystem: boolean | null
    color: string | null
    priority: number | null
    createdAt: Date | null
    updatedAt: Date | null
    organizationId: string | null
  }

  export type OrganizationRoleMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    isSystem: boolean | null
    color: string | null
    priority: number | null
    createdAt: Date | null
    updatedAt: Date | null
    organizationId: string | null
  }

  export type OrganizationRoleCountAggregateOutputType = {
    id: number
    name: number
    description: number
    isSystem: number
    permissions: number
    color: number
    priority: number
    createdAt: number
    updatedAt: number
    organizationId: number
    _all: number
  }


  export type OrganizationRoleAvgAggregateInputType = {
    priority?: true
  }

  export type OrganizationRoleSumAggregateInputType = {
    priority?: true
  }

  export type OrganizationRoleMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    isSystem?: true
    color?: true
    priority?: true
    createdAt?: true
    updatedAt?: true
    organizationId?: true
  }

  export type OrganizationRoleMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    isSystem?: true
    color?: true
    priority?: true
    createdAt?: true
    updatedAt?: true
    organizationId?: true
  }

  export type OrganizationRoleCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    isSystem?: true
    permissions?: true
    color?: true
    priority?: true
    createdAt?: true
    updatedAt?: true
    organizationId?: true
    _all?: true
  }

  export type OrganizationRoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrganizationRole to aggregate.
     */
    where?: OrganizationRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationRoles to fetch.
     */
    orderBy?: OrganizationRoleOrderByWithRelationInput | OrganizationRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrganizationRoles
    **/
    _count?: true | OrganizationRoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrganizationRoleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrganizationRoleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationRoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationRoleMaxAggregateInputType
  }

  export type GetOrganizationRoleAggregateType<T extends OrganizationRoleAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganizationRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganizationRole[P]>
      : GetScalarType<T[P], AggregateOrganizationRole[P]>
  }




  export type OrganizationRoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationRoleWhereInput
    orderBy?: OrganizationRoleOrderByWithAggregationInput | OrganizationRoleOrderByWithAggregationInput[]
    by: OrganizationRoleScalarFieldEnum[] | OrganizationRoleScalarFieldEnum
    having?: OrganizationRoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationRoleCountAggregateInputType | true
    _avg?: OrganizationRoleAvgAggregateInputType
    _sum?: OrganizationRoleSumAggregateInputType
    _min?: OrganizationRoleMinAggregateInputType
    _max?: OrganizationRoleMaxAggregateInputType
  }

  export type OrganizationRoleGroupByOutputType = {
    id: string
    name: string
    description: string | null
    isSystem: boolean
    permissions: string[]
    color: string | null
    priority: number
    createdAt: Date
    updatedAt: Date
    organizationId: string
    _count: OrganizationRoleCountAggregateOutputType | null
    _avg: OrganizationRoleAvgAggregateOutputType | null
    _sum: OrganizationRoleSumAggregateOutputType | null
    _min: OrganizationRoleMinAggregateOutputType | null
    _max: OrganizationRoleMaxAggregateOutputType | null
  }

  type GetOrganizationRoleGroupByPayload<T extends OrganizationRoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationRoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationRoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationRoleGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationRoleGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationRoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    isSystem?: boolean
    permissions?: boolean
    color?: boolean
    priority?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organizationRole"]>

  export type OrganizationRoleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    isSystem?: boolean
    permissions?: boolean
    color?: boolean
    priority?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organizationRole"]>

  export type OrganizationRoleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    isSystem?: boolean
    permissions?: boolean
    color?: boolean
    priority?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organizationRole"]>

  export type OrganizationRoleSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    isSystem?: boolean
    permissions?: boolean
    color?: boolean
    priority?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
  }

  export type OrganizationRoleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "isSystem" | "permissions" | "color" | "priority" | "createdAt" | "updatedAt" | "organizationId", ExtArgs["result"]["organizationRole"]>
  export type OrganizationRoleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type OrganizationRoleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type OrganizationRoleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $OrganizationRolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrganizationRole"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      isSystem: boolean
      permissions: string[]
      color: string | null
      priority: number
      createdAt: Date
      updatedAt: Date
      organizationId: string
    }, ExtArgs["result"]["organizationRole"]>
    composites: {}
  }

  type OrganizationRoleGetPayload<S extends boolean | null | undefined | OrganizationRoleDefaultArgs> = $Result.GetResult<Prisma.$OrganizationRolePayload, S>

  type OrganizationRoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationRoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationRoleCountAggregateInputType | true
    }

  export interface OrganizationRoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrganizationRole'], meta: { name: 'OrganizationRole' } }
    /**
     * Find zero or one OrganizationRole that matches the filter.
     * @param {OrganizationRoleFindUniqueArgs} args - Arguments to find a OrganizationRole
     * @example
     * // Get one OrganizationRole
     * const organizationRole = await prisma.organizationRole.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationRoleFindUniqueArgs>(args: SelectSubset<T, OrganizationRoleFindUniqueArgs<ExtArgs>>): Prisma__OrganizationRoleClient<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrganizationRole that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationRoleFindUniqueOrThrowArgs} args - Arguments to find a OrganizationRole
     * @example
     * // Get one OrganizationRole
     * const organizationRole = await prisma.organizationRole.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationRoleFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationRoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationRoleClient<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrganizationRole that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationRoleFindFirstArgs} args - Arguments to find a OrganizationRole
     * @example
     * // Get one OrganizationRole
     * const organizationRole = await prisma.organizationRole.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationRoleFindFirstArgs>(args?: SelectSubset<T, OrganizationRoleFindFirstArgs<ExtArgs>>): Prisma__OrganizationRoleClient<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrganizationRole that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationRoleFindFirstOrThrowArgs} args - Arguments to find a OrganizationRole
     * @example
     * // Get one OrganizationRole
     * const organizationRole = await prisma.organizationRole.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationRoleFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationRoleFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationRoleClient<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrganizationRoles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationRoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrganizationRoles
     * const organizationRoles = await prisma.organizationRole.findMany()
     * 
     * // Get first 10 OrganizationRoles
     * const organizationRoles = await prisma.organizationRole.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationRoleWithIdOnly = await prisma.organizationRole.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationRoleFindManyArgs>(args?: SelectSubset<T, OrganizationRoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrganizationRole.
     * @param {OrganizationRoleCreateArgs} args - Arguments to create a OrganizationRole.
     * @example
     * // Create one OrganizationRole
     * const OrganizationRole = await prisma.organizationRole.create({
     *   data: {
     *     // ... data to create a OrganizationRole
     *   }
     * })
     * 
     */
    create<T extends OrganizationRoleCreateArgs>(args: SelectSubset<T, OrganizationRoleCreateArgs<ExtArgs>>): Prisma__OrganizationRoleClient<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrganizationRoles.
     * @param {OrganizationRoleCreateManyArgs} args - Arguments to create many OrganizationRoles.
     * @example
     * // Create many OrganizationRoles
     * const organizationRole = await prisma.organizationRole.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationRoleCreateManyArgs>(args?: SelectSubset<T, OrganizationRoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrganizationRoles and returns the data saved in the database.
     * @param {OrganizationRoleCreateManyAndReturnArgs} args - Arguments to create many OrganizationRoles.
     * @example
     * // Create many OrganizationRoles
     * const organizationRole = await prisma.organizationRole.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrganizationRoles and only return the `id`
     * const organizationRoleWithIdOnly = await prisma.organizationRole.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganizationRoleCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationRoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrganizationRole.
     * @param {OrganizationRoleDeleteArgs} args - Arguments to delete one OrganizationRole.
     * @example
     * // Delete one OrganizationRole
     * const OrganizationRole = await prisma.organizationRole.delete({
     *   where: {
     *     // ... filter to delete one OrganizationRole
     *   }
     * })
     * 
     */
    delete<T extends OrganizationRoleDeleteArgs>(args: SelectSubset<T, OrganizationRoleDeleteArgs<ExtArgs>>): Prisma__OrganizationRoleClient<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrganizationRole.
     * @param {OrganizationRoleUpdateArgs} args - Arguments to update one OrganizationRole.
     * @example
     * // Update one OrganizationRole
     * const organizationRole = await prisma.organizationRole.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationRoleUpdateArgs>(args: SelectSubset<T, OrganizationRoleUpdateArgs<ExtArgs>>): Prisma__OrganizationRoleClient<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrganizationRoles.
     * @param {OrganizationRoleDeleteManyArgs} args - Arguments to filter OrganizationRoles to delete.
     * @example
     * // Delete a few OrganizationRoles
     * const { count } = await prisma.organizationRole.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationRoleDeleteManyArgs>(args?: SelectSubset<T, OrganizationRoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrganizationRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationRoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrganizationRoles
     * const organizationRole = await prisma.organizationRole.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationRoleUpdateManyArgs>(args: SelectSubset<T, OrganizationRoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrganizationRoles and returns the data updated in the database.
     * @param {OrganizationRoleUpdateManyAndReturnArgs} args - Arguments to update many OrganizationRoles.
     * @example
     * // Update many OrganizationRoles
     * const organizationRole = await prisma.organizationRole.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrganizationRoles and only return the `id`
     * const organizationRoleWithIdOnly = await prisma.organizationRole.updateManyAndReturn({
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
    updateManyAndReturn<T extends OrganizationRoleUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationRoleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrganizationRole.
     * @param {OrganizationRoleUpsertArgs} args - Arguments to update or create a OrganizationRole.
     * @example
     * // Update or create a OrganizationRole
     * const organizationRole = await prisma.organizationRole.upsert({
     *   create: {
     *     // ... data to create a OrganizationRole
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrganizationRole we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationRoleUpsertArgs>(args: SelectSubset<T, OrganizationRoleUpsertArgs<ExtArgs>>): Prisma__OrganizationRoleClient<$Result.GetResult<Prisma.$OrganizationRolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrganizationRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationRoleCountArgs} args - Arguments to filter OrganizationRoles to count.
     * @example
     * // Count the number of OrganizationRoles
     * const count = await prisma.organizationRole.count({
     *   where: {
     *     // ... the filter for the OrganizationRoles we want to count
     *   }
     * })
    **/
    count<T extends OrganizationRoleCountArgs>(
      args?: Subset<T, OrganizationRoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationRoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrganizationRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationRoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrganizationRoleAggregateArgs>(args: Subset<T, OrganizationRoleAggregateArgs>): Prisma.PrismaPromise<GetOrganizationRoleAggregateType<T>>

    /**
     * Group by OrganizationRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationRoleGroupByArgs} args - Group by arguments.
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
      T extends OrganizationRoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationRoleGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationRoleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrganizationRoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrganizationRole model
   */
  readonly fields: OrganizationRoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrganizationRole.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationRoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the OrganizationRole model
   */
  interface OrganizationRoleFieldRefs {
    readonly id: FieldRef<"OrganizationRole", 'String'>
    readonly name: FieldRef<"OrganizationRole", 'String'>
    readonly description: FieldRef<"OrganizationRole", 'String'>
    readonly isSystem: FieldRef<"OrganizationRole", 'Boolean'>
    readonly permissions: FieldRef<"OrganizationRole", 'String[]'>
    readonly color: FieldRef<"OrganizationRole", 'String'>
    readonly priority: FieldRef<"OrganizationRole", 'Int'>
    readonly createdAt: FieldRef<"OrganizationRole", 'DateTime'>
    readonly updatedAt: FieldRef<"OrganizationRole", 'DateTime'>
    readonly organizationId: FieldRef<"OrganizationRole", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OrganizationRole findUnique
   */
  export type OrganizationRoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationRole to fetch.
     */
    where: OrganizationRoleWhereUniqueInput
  }

  /**
   * OrganizationRole findUniqueOrThrow
   */
  export type OrganizationRoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationRole to fetch.
     */
    where: OrganizationRoleWhereUniqueInput
  }

  /**
   * OrganizationRole findFirst
   */
  export type OrganizationRoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationRole to fetch.
     */
    where?: OrganizationRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationRoles to fetch.
     */
    orderBy?: OrganizationRoleOrderByWithRelationInput | OrganizationRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrganizationRoles.
     */
    cursor?: OrganizationRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrganizationRoles.
     */
    distinct?: OrganizationRoleScalarFieldEnum | OrganizationRoleScalarFieldEnum[]
  }

  /**
   * OrganizationRole findFirstOrThrow
   */
  export type OrganizationRoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationRole to fetch.
     */
    where?: OrganizationRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationRoles to fetch.
     */
    orderBy?: OrganizationRoleOrderByWithRelationInput | OrganizationRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrganizationRoles.
     */
    cursor?: OrganizationRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrganizationRoles.
     */
    distinct?: OrganizationRoleScalarFieldEnum | OrganizationRoleScalarFieldEnum[]
  }

  /**
   * OrganizationRole findMany
   */
  export type OrganizationRoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrganizationRoles to fetch.
     */
    where?: OrganizationRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganizationRoles to fetch.
     */
    orderBy?: OrganizationRoleOrderByWithRelationInput | OrganizationRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrganizationRoles.
     */
    cursor?: OrganizationRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganizationRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganizationRoles.
     */
    skip?: number
    distinct?: OrganizationRoleScalarFieldEnum | OrganizationRoleScalarFieldEnum[]
  }

  /**
   * OrganizationRole create
   */
  export type OrganizationRoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    /**
     * The data needed to create a OrganizationRole.
     */
    data: XOR<OrganizationRoleCreateInput, OrganizationRoleUncheckedCreateInput>
  }

  /**
   * OrganizationRole createMany
   */
  export type OrganizationRoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrganizationRoles.
     */
    data: OrganizationRoleCreateManyInput | OrganizationRoleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrganizationRole createManyAndReturn
   */
  export type OrganizationRoleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * The data used to create many OrganizationRoles.
     */
    data: OrganizationRoleCreateManyInput | OrganizationRoleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrganizationRole update
   */
  export type OrganizationRoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    /**
     * The data needed to update a OrganizationRole.
     */
    data: XOR<OrganizationRoleUpdateInput, OrganizationRoleUncheckedUpdateInput>
    /**
     * Choose, which OrganizationRole to update.
     */
    where: OrganizationRoleWhereUniqueInput
  }

  /**
   * OrganizationRole updateMany
   */
  export type OrganizationRoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrganizationRoles.
     */
    data: XOR<OrganizationRoleUpdateManyMutationInput, OrganizationRoleUncheckedUpdateManyInput>
    /**
     * Filter which OrganizationRoles to update
     */
    where?: OrganizationRoleWhereInput
    /**
     * Limit how many OrganizationRoles to update.
     */
    limit?: number
  }

  /**
   * OrganizationRole updateManyAndReturn
   */
  export type OrganizationRoleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * The data used to update OrganizationRoles.
     */
    data: XOR<OrganizationRoleUpdateManyMutationInput, OrganizationRoleUncheckedUpdateManyInput>
    /**
     * Filter which OrganizationRoles to update
     */
    where?: OrganizationRoleWhereInput
    /**
     * Limit how many OrganizationRoles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrganizationRole upsert
   */
  export type OrganizationRoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    /**
     * The filter to search for the OrganizationRole to update in case it exists.
     */
    where: OrganizationRoleWhereUniqueInput
    /**
     * In case the OrganizationRole found by the `where` argument doesn't exist, create a new OrganizationRole with this data.
     */
    create: XOR<OrganizationRoleCreateInput, OrganizationRoleUncheckedCreateInput>
    /**
     * In case the OrganizationRole was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationRoleUpdateInput, OrganizationRoleUncheckedUpdateInput>
  }

  /**
   * OrganizationRole delete
   */
  export type OrganizationRoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
    /**
     * Filter which OrganizationRole to delete.
     */
    where: OrganizationRoleWhereUniqueInput
  }

  /**
   * OrganizationRole deleteMany
   */
  export type OrganizationRoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrganizationRoles to delete
     */
    where?: OrganizationRoleWhereInput
    /**
     * Limit how many OrganizationRoles to delete.
     */
    limit?: number
  }

  /**
   * OrganizationRole without action
   */
  export type OrganizationRoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationRole
     */
    select?: OrganizationRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganizationRole
     */
    omit?: OrganizationRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationRoleInclude<ExtArgs> | null
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


  export const OrganizationScalarFieldEnum: {
    id: 'id',
    subdomain: 'subdomain',
    name: 'name',
    address: 'address',
    phone: 'phone',
    email: 'email',
    active: 'active',
    encryptionKey: 'encryptionKey',
    keyVersion: 'keyVersion',
    keyRotatedAt: 'keyRotatedAt',
    subscriptionPlan: 'subscriptionPlan',
    subscriptionStatus: 'subscriptionStatus',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrganizationScalarFieldEnum = (typeof OrganizationScalarFieldEnum)[keyof typeof OrganizationScalarFieldEnum]


  export const OrganizationSettingsScalarFieldEnum: {
    id: 'id',
    timezone: 'timezone',
    locale: 'locale',
    customSettings: 'customSettings',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    organizationId: 'organizationId'
  };

  export type OrganizationSettingsScalarFieldEnum = (typeof OrganizationSettingsScalarFieldEnum)[keyof typeof OrganizationSettingsScalarFieldEnum]


  export const OrganizationRoleScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    isSystem: 'isSystem',
    permissions: 'permissions',
    color: 'color',
    priority: 'priority',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    organizationId: 'organizationId'
  };

  export type OrganizationRoleScalarFieldEnum = (typeof OrganizationRoleScalarFieldEnum)[keyof typeof OrganizationRoleScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


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
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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


  export type OrganizationWhereInput = {
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    id?: StringFilter<"Organization"> | string
    subdomain?: StringFilter<"Organization"> | string
    name?: StringFilter<"Organization"> | string
    address?: StringNullableFilter<"Organization"> | string | null
    phone?: StringNullableFilter<"Organization"> | string | null
    email?: StringNullableFilter<"Organization"> | string | null
    active?: BoolFilter<"Organization"> | boolean
    encryptionKey?: StringFilter<"Organization"> | string
    keyVersion?: IntFilter<"Organization"> | number
    keyRotatedAt?: DateTimeFilter<"Organization"> | Date | string
    subscriptionPlan?: StringFilter<"Organization"> | string
    subscriptionStatus?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    settings?: XOR<OrganizationSettingsNullableScalarRelationFilter, OrganizationSettingsWhereInput> | null
    roles?: OrganizationRoleListRelationFilter
  }

  export type OrganizationOrderByWithRelationInput = {
    id?: SortOrder
    subdomain?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    active?: SortOrder
    encryptionKey?: SortOrder
    keyVersion?: SortOrder
    keyRotatedAt?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    settings?: OrganizationSettingsOrderByWithRelationInput
    roles?: OrganizationRoleOrderByRelationAggregateInput
  }

  export type OrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    subdomain?: string
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    name?: StringFilter<"Organization"> | string
    address?: StringNullableFilter<"Organization"> | string | null
    phone?: StringNullableFilter<"Organization"> | string | null
    email?: StringNullableFilter<"Organization"> | string | null
    active?: BoolFilter<"Organization"> | boolean
    encryptionKey?: StringFilter<"Organization"> | string
    keyVersion?: IntFilter<"Organization"> | number
    keyRotatedAt?: DateTimeFilter<"Organization"> | Date | string
    subscriptionPlan?: StringFilter<"Organization"> | string
    subscriptionStatus?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    settings?: XOR<OrganizationSettingsNullableScalarRelationFilter, OrganizationSettingsWhereInput> | null
    roles?: OrganizationRoleListRelationFilter
  }, "id" | "subdomain">

  export type OrganizationOrderByWithAggregationInput = {
    id?: SortOrder
    subdomain?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    active?: SortOrder
    encryptionKey?: SortOrder
    keyVersion?: SortOrder
    keyRotatedAt?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrganizationCountOrderByAggregateInput
    _avg?: OrganizationAvgOrderByAggregateInput
    _max?: OrganizationMaxOrderByAggregateInput
    _min?: OrganizationMinOrderByAggregateInput
    _sum?: OrganizationSumOrderByAggregateInput
  }

  export type OrganizationScalarWhereWithAggregatesInput = {
    AND?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    OR?: OrganizationScalarWhereWithAggregatesInput[]
    NOT?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Organization"> | string
    subdomain?: StringWithAggregatesFilter<"Organization"> | string
    name?: StringWithAggregatesFilter<"Organization"> | string
    address?: StringNullableWithAggregatesFilter<"Organization"> | string | null
    phone?: StringNullableWithAggregatesFilter<"Organization"> | string | null
    email?: StringNullableWithAggregatesFilter<"Organization"> | string | null
    active?: BoolWithAggregatesFilter<"Organization"> | boolean
    encryptionKey?: StringWithAggregatesFilter<"Organization"> | string
    keyVersion?: IntWithAggregatesFilter<"Organization"> | number
    keyRotatedAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    subscriptionPlan?: StringWithAggregatesFilter<"Organization"> | string
    subscriptionStatus?: StringWithAggregatesFilter<"Organization"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
  }

  export type OrganizationSettingsWhereInput = {
    AND?: OrganizationSettingsWhereInput | OrganizationSettingsWhereInput[]
    OR?: OrganizationSettingsWhereInput[]
    NOT?: OrganizationSettingsWhereInput | OrganizationSettingsWhereInput[]
    id?: StringFilter<"OrganizationSettings"> | string
    timezone?: StringFilter<"OrganizationSettings"> | string
    locale?: StringFilter<"OrganizationSettings"> | string
    customSettings?: JsonFilter<"OrganizationSettings">
    createdAt?: DateTimeFilter<"OrganizationSettings"> | Date | string
    updatedAt?: DateTimeFilter<"OrganizationSettings"> | Date | string
    organizationId?: StringFilter<"OrganizationSettings"> | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type OrganizationSettingsOrderByWithRelationInput = {
    id?: SortOrder
    timezone?: SortOrder
    locale?: SortOrder
    customSettings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
  }

  export type OrganizationSettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId?: string
    AND?: OrganizationSettingsWhereInput | OrganizationSettingsWhereInput[]
    OR?: OrganizationSettingsWhereInput[]
    NOT?: OrganizationSettingsWhereInput | OrganizationSettingsWhereInput[]
    timezone?: StringFilter<"OrganizationSettings"> | string
    locale?: StringFilter<"OrganizationSettings"> | string
    customSettings?: JsonFilter<"OrganizationSettings">
    createdAt?: DateTimeFilter<"OrganizationSettings"> | Date | string
    updatedAt?: DateTimeFilter<"OrganizationSettings"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id" | "organizationId">

  export type OrganizationSettingsOrderByWithAggregationInput = {
    id?: SortOrder
    timezone?: SortOrder
    locale?: SortOrder
    customSettings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
    _count?: OrganizationSettingsCountOrderByAggregateInput
    _max?: OrganizationSettingsMaxOrderByAggregateInput
    _min?: OrganizationSettingsMinOrderByAggregateInput
  }

  export type OrganizationSettingsScalarWhereWithAggregatesInput = {
    AND?: OrganizationSettingsScalarWhereWithAggregatesInput | OrganizationSettingsScalarWhereWithAggregatesInput[]
    OR?: OrganizationSettingsScalarWhereWithAggregatesInput[]
    NOT?: OrganizationSettingsScalarWhereWithAggregatesInput | OrganizationSettingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrganizationSettings"> | string
    timezone?: StringWithAggregatesFilter<"OrganizationSettings"> | string
    locale?: StringWithAggregatesFilter<"OrganizationSettings"> | string
    customSettings?: JsonWithAggregatesFilter<"OrganizationSettings">
    createdAt?: DateTimeWithAggregatesFilter<"OrganizationSettings"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OrganizationSettings"> | Date | string
    organizationId?: StringWithAggregatesFilter<"OrganizationSettings"> | string
  }

  export type OrganizationRoleWhereInput = {
    AND?: OrganizationRoleWhereInput | OrganizationRoleWhereInput[]
    OR?: OrganizationRoleWhereInput[]
    NOT?: OrganizationRoleWhereInput | OrganizationRoleWhereInput[]
    id?: StringFilter<"OrganizationRole"> | string
    name?: StringFilter<"OrganizationRole"> | string
    description?: StringNullableFilter<"OrganizationRole"> | string | null
    isSystem?: BoolFilter<"OrganizationRole"> | boolean
    permissions?: StringNullableListFilter<"OrganizationRole">
    color?: StringNullableFilter<"OrganizationRole"> | string | null
    priority?: IntFilter<"OrganizationRole"> | number
    createdAt?: DateTimeFilter<"OrganizationRole"> | Date | string
    updatedAt?: DateTimeFilter<"OrganizationRole"> | Date | string
    organizationId?: StringFilter<"OrganizationRole"> | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type OrganizationRoleOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    isSystem?: SortOrder
    permissions?: SortOrder
    color?: SortOrderInput | SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
  }

  export type OrganizationRoleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId_name?: OrganizationRoleOrganizationIdNameCompoundUniqueInput
    AND?: OrganizationRoleWhereInput | OrganizationRoleWhereInput[]
    OR?: OrganizationRoleWhereInput[]
    NOT?: OrganizationRoleWhereInput | OrganizationRoleWhereInput[]
    name?: StringFilter<"OrganizationRole"> | string
    description?: StringNullableFilter<"OrganizationRole"> | string | null
    isSystem?: BoolFilter<"OrganizationRole"> | boolean
    permissions?: StringNullableListFilter<"OrganizationRole">
    color?: StringNullableFilter<"OrganizationRole"> | string | null
    priority?: IntFilter<"OrganizationRole"> | number
    createdAt?: DateTimeFilter<"OrganizationRole"> | Date | string
    updatedAt?: DateTimeFilter<"OrganizationRole"> | Date | string
    organizationId?: StringFilter<"OrganizationRole"> | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id" | "organizationId_name">

  export type OrganizationRoleOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    isSystem?: SortOrder
    permissions?: SortOrder
    color?: SortOrderInput | SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
    _count?: OrganizationRoleCountOrderByAggregateInput
    _avg?: OrganizationRoleAvgOrderByAggregateInput
    _max?: OrganizationRoleMaxOrderByAggregateInput
    _min?: OrganizationRoleMinOrderByAggregateInput
    _sum?: OrganizationRoleSumOrderByAggregateInput
  }

  export type OrganizationRoleScalarWhereWithAggregatesInput = {
    AND?: OrganizationRoleScalarWhereWithAggregatesInput | OrganizationRoleScalarWhereWithAggregatesInput[]
    OR?: OrganizationRoleScalarWhereWithAggregatesInput[]
    NOT?: OrganizationRoleScalarWhereWithAggregatesInput | OrganizationRoleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrganizationRole"> | string
    name?: StringWithAggregatesFilter<"OrganizationRole"> | string
    description?: StringNullableWithAggregatesFilter<"OrganizationRole"> | string | null
    isSystem?: BoolWithAggregatesFilter<"OrganizationRole"> | boolean
    permissions?: StringNullableListFilter<"OrganizationRole">
    color?: StringNullableWithAggregatesFilter<"OrganizationRole"> | string | null
    priority?: IntWithAggregatesFilter<"OrganizationRole"> | number
    createdAt?: DateTimeWithAggregatesFilter<"OrganizationRole"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OrganizationRole"> | Date | string
    organizationId?: StringWithAggregatesFilter<"OrganizationRole"> | string
  }

  export type OrganizationCreateInput = {
    id?: string
    subdomain: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    active?: boolean
    encryptionKey: string
    keyVersion?: number
    keyRotatedAt?: Date | string
    subscriptionPlan?: string
    subscriptionStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    settings?: OrganizationSettingsCreateNestedOneWithoutOrganizationInput
    roles?: OrganizationRoleCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateInput = {
    id?: string
    subdomain: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    active?: boolean
    encryptionKey: string
    keyVersion?: number
    keyRotatedAt?: Date | string
    subscriptionPlan?: string
    subscriptionStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    settings?: OrganizationSettingsUncheckedCreateNestedOneWithoutOrganizationInput
    roles?: OrganizationRoleUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    encryptionKey?: StringFieldUpdateOperationsInput | string
    keyVersion?: IntFieldUpdateOperationsInput | number
    keyRotatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptionPlan?: StringFieldUpdateOperationsInput | string
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    settings?: OrganizationSettingsUpdateOneWithoutOrganizationNestedInput
    roles?: OrganizationRoleUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    encryptionKey?: StringFieldUpdateOperationsInput | string
    keyVersion?: IntFieldUpdateOperationsInput | number
    keyRotatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptionPlan?: StringFieldUpdateOperationsInput | string
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    settings?: OrganizationSettingsUncheckedUpdateOneWithoutOrganizationNestedInput
    roles?: OrganizationRoleUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationCreateManyInput = {
    id?: string
    subdomain: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    active?: boolean
    encryptionKey: string
    keyVersion?: number
    keyRotatedAt?: Date | string
    subscriptionPlan?: string
    subscriptionStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    encryptionKey?: StringFieldUpdateOperationsInput | string
    keyVersion?: IntFieldUpdateOperationsInput | number
    keyRotatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptionPlan?: StringFieldUpdateOperationsInput | string
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    encryptionKey?: StringFieldUpdateOperationsInput | string
    keyVersion?: IntFieldUpdateOperationsInput | number
    keyRotatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptionPlan?: StringFieldUpdateOperationsInput | string
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationSettingsCreateInput = {
    id?: string
    timezone?: string
    locale?: string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutSettingsInput
  }

  export type OrganizationSettingsUncheckedCreateInput = {
    id?: string
    timezone?: string
    locale?: string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
  }

  export type OrganizationSettingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutSettingsNestedInput
  }

  export type OrganizationSettingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
  }

  export type OrganizationSettingsCreateManyInput = {
    id?: string
    timezone?: string
    locale?: string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
  }

  export type OrganizationSettingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationSettingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
  }

  export type OrganizationRoleCreateInput = {
    id?: string
    name: string
    description?: string | null
    isSystem?: boolean
    permissions?: OrganizationRoleCreatepermissionsInput | string[]
    color?: string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRolesInput
  }

  export type OrganizationRoleUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    isSystem?: boolean
    permissions?: OrganizationRoleCreatepermissionsInput | string[]
    color?: string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
  }

  export type OrganizationRoleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    permissions?: OrganizationRoleUpdatepermissionsInput | string[]
    color?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRolesNestedInput
  }

  export type OrganizationRoleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    permissions?: OrganizationRoleUpdatepermissionsInput | string[]
    color?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
  }

  export type OrganizationRoleCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    isSystem?: boolean
    permissions?: OrganizationRoleCreatepermissionsInput | string[]
    color?: string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
  }

  export type OrganizationRoleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    permissions?: OrganizationRoleUpdatepermissionsInput | string[]
    color?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationRoleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    permissions?: OrganizationRoleUpdatepermissionsInput | string[]
    color?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type OrganizationSettingsNullableScalarRelationFilter = {
    is?: OrganizationSettingsWhereInput | null
    isNot?: OrganizationSettingsWhereInput | null
  }

  export type OrganizationRoleListRelationFilter = {
    every?: OrganizationRoleWhereInput
    some?: OrganizationRoleWhereInput
    none?: OrganizationRoleWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type OrganizationRoleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrganizationCountOrderByAggregateInput = {
    id?: SortOrder
    subdomain?: SortOrder
    name?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    active?: SortOrder
    encryptionKey?: SortOrder
    keyVersion?: SortOrder
    keyRotatedAt?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationAvgOrderByAggregateInput = {
    keyVersion?: SortOrder
  }

  export type OrganizationMaxOrderByAggregateInput = {
    id?: SortOrder
    subdomain?: SortOrder
    name?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    active?: SortOrder
    encryptionKey?: SortOrder
    keyVersion?: SortOrder
    keyRotatedAt?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationMinOrderByAggregateInput = {
    id?: SortOrder
    subdomain?: SortOrder
    name?: SortOrder
    address?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    active?: SortOrder
    encryptionKey?: SortOrder
    keyVersion?: SortOrder
    keyRotatedAt?: SortOrder
    subscriptionPlan?: SortOrder
    subscriptionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationSumOrderByAggregateInput = {
    keyVersion?: SortOrder
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
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

  export type OrganizationScalarRelationFilter = {
    is?: OrganizationWhereInput
    isNot?: OrganizationWhereInput
  }

  export type OrganizationSettingsCountOrderByAggregateInput = {
    id?: SortOrder
    timezone?: SortOrder
    locale?: SortOrder
    customSettings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
  }

  export type OrganizationSettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    timezone?: SortOrder
    locale?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
  }

  export type OrganizationSettingsMinOrderByAggregateInput = {
    id?: SortOrder
    timezone?: SortOrder
    locale?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type OrganizationRoleOrganizationIdNameCompoundUniqueInput = {
    organizationId: string
    name: string
  }

  export type OrganizationRoleCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    isSystem?: SortOrder
    permissions?: SortOrder
    color?: SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
  }

  export type OrganizationRoleAvgOrderByAggregateInput = {
    priority?: SortOrder
  }

  export type OrganizationRoleMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    isSystem?: SortOrder
    color?: SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
  }

  export type OrganizationRoleMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    isSystem?: SortOrder
    color?: SortOrder
    priority?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
  }

  export type OrganizationRoleSumOrderByAggregateInput = {
    priority?: SortOrder
  }

  export type OrganizationSettingsCreateNestedOneWithoutOrganizationInput = {
    create?: XOR<OrganizationSettingsCreateWithoutOrganizationInput, OrganizationSettingsUncheckedCreateWithoutOrganizationInput>
    connectOrCreate?: OrganizationSettingsCreateOrConnectWithoutOrganizationInput
    connect?: OrganizationSettingsWhereUniqueInput
  }

  export type OrganizationRoleCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<OrganizationRoleCreateWithoutOrganizationInput, OrganizationRoleUncheckedCreateWithoutOrganizationInput> | OrganizationRoleCreateWithoutOrganizationInput[] | OrganizationRoleUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OrganizationRoleCreateOrConnectWithoutOrganizationInput | OrganizationRoleCreateOrConnectWithoutOrganizationInput[]
    createMany?: OrganizationRoleCreateManyOrganizationInputEnvelope
    connect?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
  }

  export type OrganizationSettingsUncheckedCreateNestedOneWithoutOrganizationInput = {
    create?: XOR<OrganizationSettingsCreateWithoutOrganizationInput, OrganizationSettingsUncheckedCreateWithoutOrganizationInput>
    connectOrCreate?: OrganizationSettingsCreateOrConnectWithoutOrganizationInput
    connect?: OrganizationSettingsWhereUniqueInput
  }

  export type OrganizationRoleUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<OrganizationRoleCreateWithoutOrganizationInput, OrganizationRoleUncheckedCreateWithoutOrganizationInput> | OrganizationRoleCreateWithoutOrganizationInput[] | OrganizationRoleUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OrganizationRoleCreateOrConnectWithoutOrganizationInput | OrganizationRoleCreateOrConnectWithoutOrganizationInput[]
    createMany?: OrganizationRoleCreateManyOrganizationInputEnvelope
    connect?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type OrganizationSettingsUpdateOneWithoutOrganizationNestedInput = {
    create?: XOR<OrganizationSettingsCreateWithoutOrganizationInput, OrganizationSettingsUncheckedCreateWithoutOrganizationInput>
    connectOrCreate?: OrganizationSettingsCreateOrConnectWithoutOrganizationInput
    upsert?: OrganizationSettingsUpsertWithoutOrganizationInput
    disconnect?: OrganizationSettingsWhereInput | boolean
    delete?: OrganizationSettingsWhereInput | boolean
    connect?: OrganizationSettingsWhereUniqueInput
    update?: XOR<XOR<OrganizationSettingsUpdateToOneWithWhereWithoutOrganizationInput, OrganizationSettingsUpdateWithoutOrganizationInput>, OrganizationSettingsUncheckedUpdateWithoutOrganizationInput>
  }

  export type OrganizationRoleUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<OrganizationRoleCreateWithoutOrganizationInput, OrganizationRoleUncheckedCreateWithoutOrganizationInput> | OrganizationRoleCreateWithoutOrganizationInput[] | OrganizationRoleUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OrganizationRoleCreateOrConnectWithoutOrganizationInput | OrganizationRoleCreateOrConnectWithoutOrganizationInput[]
    upsert?: OrganizationRoleUpsertWithWhereUniqueWithoutOrganizationInput | OrganizationRoleUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: OrganizationRoleCreateManyOrganizationInputEnvelope
    set?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
    disconnect?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
    delete?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
    connect?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
    update?: OrganizationRoleUpdateWithWhereUniqueWithoutOrganizationInput | OrganizationRoleUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: OrganizationRoleUpdateManyWithWhereWithoutOrganizationInput | OrganizationRoleUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: OrganizationRoleScalarWhereInput | OrganizationRoleScalarWhereInput[]
  }

  export type OrganizationSettingsUncheckedUpdateOneWithoutOrganizationNestedInput = {
    create?: XOR<OrganizationSettingsCreateWithoutOrganizationInput, OrganizationSettingsUncheckedCreateWithoutOrganizationInput>
    connectOrCreate?: OrganizationSettingsCreateOrConnectWithoutOrganizationInput
    upsert?: OrganizationSettingsUpsertWithoutOrganizationInput
    disconnect?: OrganizationSettingsWhereInput | boolean
    delete?: OrganizationSettingsWhereInput | boolean
    connect?: OrganizationSettingsWhereUniqueInput
    update?: XOR<XOR<OrganizationSettingsUpdateToOneWithWhereWithoutOrganizationInput, OrganizationSettingsUpdateWithoutOrganizationInput>, OrganizationSettingsUncheckedUpdateWithoutOrganizationInput>
  }

  export type OrganizationRoleUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<OrganizationRoleCreateWithoutOrganizationInput, OrganizationRoleUncheckedCreateWithoutOrganizationInput> | OrganizationRoleCreateWithoutOrganizationInput[] | OrganizationRoleUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OrganizationRoleCreateOrConnectWithoutOrganizationInput | OrganizationRoleCreateOrConnectWithoutOrganizationInput[]
    upsert?: OrganizationRoleUpsertWithWhereUniqueWithoutOrganizationInput | OrganizationRoleUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: OrganizationRoleCreateManyOrganizationInputEnvelope
    set?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
    disconnect?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
    delete?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
    connect?: OrganizationRoleWhereUniqueInput | OrganizationRoleWhereUniqueInput[]
    update?: OrganizationRoleUpdateWithWhereUniqueWithoutOrganizationInput | OrganizationRoleUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: OrganizationRoleUpdateManyWithWhereWithoutOrganizationInput | OrganizationRoleUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: OrganizationRoleScalarWhereInput | OrganizationRoleScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutSettingsInput = {
    create?: XOR<OrganizationCreateWithoutSettingsInput, OrganizationUncheckedCreateWithoutSettingsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutSettingsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type OrganizationUpdateOneRequiredWithoutSettingsNestedInput = {
    create?: XOR<OrganizationCreateWithoutSettingsInput, OrganizationUncheckedCreateWithoutSettingsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutSettingsInput
    upsert?: OrganizationUpsertWithoutSettingsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutSettingsInput, OrganizationUpdateWithoutSettingsInput>, OrganizationUncheckedUpdateWithoutSettingsInput>
  }

  export type OrganizationRoleCreatepermissionsInput = {
    set: string[]
  }

  export type OrganizationCreateNestedOneWithoutRolesInput = {
    create?: XOR<OrganizationCreateWithoutRolesInput, OrganizationUncheckedCreateWithoutRolesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRolesInput
    connect?: OrganizationWhereUniqueInput
  }

  export type OrganizationRoleUpdatepermissionsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type OrganizationUpdateOneRequiredWithoutRolesNestedInput = {
    create?: XOR<OrganizationCreateWithoutRolesInput, OrganizationUncheckedCreateWithoutRolesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRolesInput
    upsert?: OrganizationUpsertWithoutRolesInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutRolesInput, OrganizationUpdateWithoutRolesInput>, OrganizationUncheckedUpdateWithoutRolesInput>
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
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

  export type OrganizationSettingsCreateWithoutOrganizationInput = {
    id?: string
    timezone?: string
    locale?: string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationSettingsUncheckedCreateWithoutOrganizationInput = {
    id?: string
    timezone?: string
    locale?: string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationSettingsCreateOrConnectWithoutOrganizationInput = {
    where: OrganizationSettingsWhereUniqueInput
    create: XOR<OrganizationSettingsCreateWithoutOrganizationInput, OrganizationSettingsUncheckedCreateWithoutOrganizationInput>
  }

  export type OrganizationRoleCreateWithoutOrganizationInput = {
    id?: string
    name: string
    description?: string | null
    isSystem?: boolean
    permissions?: OrganizationRoleCreatepermissionsInput | string[]
    color?: string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationRoleUncheckedCreateWithoutOrganizationInput = {
    id?: string
    name: string
    description?: string | null
    isSystem?: boolean
    permissions?: OrganizationRoleCreatepermissionsInput | string[]
    color?: string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationRoleCreateOrConnectWithoutOrganizationInput = {
    where: OrganizationRoleWhereUniqueInput
    create: XOR<OrganizationRoleCreateWithoutOrganizationInput, OrganizationRoleUncheckedCreateWithoutOrganizationInput>
  }

  export type OrganizationRoleCreateManyOrganizationInputEnvelope = {
    data: OrganizationRoleCreateManyOrganizationInput | OrganizationRoleCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationSettingsUpsertWithoutOrganizationInput = {
    update: XOR<OrganizationSettingsUpdateWithoutOrganizationInput, OrganizationSettingsUncheckedUpdateWithoutOrganizationInput>
    create: XOR<OrganizationSettingsCreateWithoutOrganizationInput, OrganizationSettingsUncheckedCreateWithoutOrganizationInput>
    where?: OrganizationSettingsWhereInput
  }

  export type OrganizationSettingsUpdateToOneWithWhereWithoutOrganizationInput = {
    where?: OrganizationSettingsWhereInput
    data: XOR<OrganizationSettingsUpdateWithoutOrganizationInput, OrganizationSettingsUncheckedUpdateWithoutOrganizationInput>
  }

  export type OrganizationSettingsUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationSettingsUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    timezone?: StringFieldUpdateOperationsInput | string
    locale?: StringFieldUpdateOperationsInput | string
    customSettings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationRoleUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: OrganizationRoleWhereUniqueInput
    update: XOR<OrganizationRoleUpdateWithoutOrganizationInput, OrganizationRoleUncheckedUpdateWithoutOrganizationInput>
    create: XOR<OrganizationRoleCreateWithoutOrganizationInput, OrganizationRoleUncheckedCreateWithoutOrganizationInput>
  }

  export type OrganizationRoleUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: OrganizationRoleWhereUniqueInput
    data: XOR<OrganizationRoleUpdateWithoutOrganizationInput, OrganizationRoleUncheckedUpdateWithoutOrganizationInput>
  }

  export type OrganizationRoleUpdateManyWithWhereWithoutOrganizationInput = {
    where: OrganizationRoleScalarWhereInput
    data: XOR<OrganizationRoleUpdateManyMutationInput, OrganizationRoleUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type OrganizationRoleScalarWhereInput = {
    AND?: OrganizationRoleScalarWhereInput | OrganizationRoleScalarWhereInput[]
    OR?: OrganizationRoleScalarWhereInput[]
    NOT?: OrganizationRoleScalarWhereInput | OrganizationRoleScalarWhereInput[]
    id?: StringFilter<"OrganizationRole"> | string
    name?: StringFilter<"OrganizationRole"> | string
    description?: StringNullableFilter<"OrganizationRole"> | string | null
    isSystem?: BoolFilter<"OrganizationRole"> | boolean
    permissions?: StringNullableListFilter<"OrganizationRole">
    color?: StringNullableFilter<"OrganizationRole"> | string | null
    priority?: IntFilter<"OrganizationRole"> | number
    createdAt?: DateTimeFilter<"OrganizationRole"> | Date | string
    updatedAt?: DateTimeFilter<"OrganizationRole"> | Date | string
    organizationId?: StringFilter<"OrganizationRole"> | string
  }

  export type OrganizationCreateWithoutSettingsInput = {
    id?: string
    subdomain: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    active?: boolean
    encryptionKey: string
    keyVersion?: number
    keyRotatedAt?: Date | string
    subscriptionPlan?: string
    subscriptionStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    roles?: OrganizationRoleCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutSettingsInput = {
    id?: string
    subdomain: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    active?: boolean
    encryptionKey: string
    keyVersion?: number
    keyRotatedAt?: Date | string
    subscriptionPlan?: string
    subscriptionStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    roles?: OrganizationRoleUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutSettingsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutSettingsInput, OrganizationUncheckedCreateWithoutSettingsInput>
  }

  export type OrganizationUpsertWithoutSettingsInput = {
    update: XOR<OrganizationUpdateWithoutSettingsInput, OrganizationUncheckedUpdateWithoutSettingsInput>
    create: XOR<OrganizationCreateWithoutSettingsInput, OrganizationUncheckedCreateWithoutSettingsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutSettingsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutSettingsInput, OrganizationUncheckedUpdateWithoutSettingsInput>
  }

  export type OrganizationUpdateWithoutSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    encryptionKey?: StringFieldUpdateOperationsInput | string
    keyVersion?: IntFieldUpdateOperationsInput | number
    keyRotatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptionPlan?: StringFieldUpdateOperationsInput | string
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roles?: OrganizationRoleUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutSettingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    encryptionKey?: StringFieldUpdateOperationsInput | string
    keyVersion?: IntFieldUpdateOperationsInput | number
    keyRotatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptionPlan?: StringFieldUpdateOperationsInput | string
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roles?: OrganizationRoleUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationCreateWithoutRolesInput = {
    id?: string
    subdomain: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    active?: boolean
    encryptionKey: string
    keyVersion?: number
    keyRotatedAt?: Date | string
    subscriptionPlan?: string
    subscriptionStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    settings?: OrganizationSettingsCreateNestedOneWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutRolesInput = {
    id?: string
    subdomain: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
    active?: boolean
    encryptionKey: string
    keyVersion?: number
    keyRotatedAt?: Date | string
    subscriptionPlan?: string
    subscriptionStatus?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    settings?: OrganizationSettingsUncheckedCreateNestedOneWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutRolesInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutRolesInput, OrganizationUncheckedCreateWithoutRolesInput>
  }

  export type OrganizationUpsertWithoutRolesInput = {
    update: XOR<OrganizationUpdateWithoutRolesInput, OrganizationUncheckedUpdateWithoutRolesInput>
    create: XOR<OrganizationCreateWithoutRolesInput, OrganizationUncheckedCreateWithoutRolesInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutRolesInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutRolesInput, OrganizationUncheckedUpdateWithoutRolesInput>
  }

  export type OrganizationUpdateWithoutRolesInput = {
    id?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    encryptionKey?: StringFieldUpdateOperationsInput | string
    keyVersion?: IntFieldUpdateOperationsInput | number
    keyRotatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptionPlan?: StringFieldUpdateOperationsInput | string
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    settings?: OrganizationSettingsUpdateOneWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutRolesInput = {
    id?: StringFieldUpdateOperationsInput | string
    subdomain?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    active?: BoolFieldUpdateOperationsInput | boolean
    encryptionKey?: StringFieldUpdateOperationsInput | string
    keyVersion?: IntFieldUpdateOperationsInput | number
    keyRotatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptionPlan?: StringFieldUpdateOperationsInput | string
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    settings?: OrganizationSettingsUncheckedUpdateOneWithoutOrganizationNestedInput
  }

  export type OrganizationRoleCreateManyOrganizationInput = {
    id?: string
    name: string
    description?: string | null
    isSystem?: boolean
    permissions?: OrganizationRoleCreatepermissionsInput | string[]
    color?: string | null
    priority?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationRoleUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    permissions?: OrganizationRoleUpdatepermissionsInput | string[]
    color?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationRoleUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    permissions?: OrganizationRoleUpdatepermissionsInput | string[]
    color?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationRoleUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    permissions?: OrganizationRoleUpdatepermissionsInput | string[]
    color?: NullableStringFieldUpdateOperationsInput | string | null
    priority?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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