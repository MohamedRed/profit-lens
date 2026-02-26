type Store = Map<string, Record<string, any>>;

type DocRef = {
  __type: "doc";
  id: string;
  path: string;
  collection: (name: string) => CollectionRef;
  delete: () => Promise<void>;
};

type QueryRef = {
  __type: "query";
  pathPrefix: string;
  field: string;
  value: any;
  get: () => Promise<QuerySnapshot>;
};

type QuerySnapshot = {
  docs: QueryDocSnapshot[];
  empty: boolean;
};

type QueryDocSnapshot = {
  id: string;
  data: () => Record<string, any>;
};

type CollectionRef = {
  doc: (id: string) => DocRef;
  collection: (name: string) => CollectionRef;
  where: (field: string, op: string, value: any) => QueryRef;
};

type Transaction = {
  get: (ref: DocRef | QueryRef) => Promise<{
    exists: boolean;
    data: () => Record<string, any>;
    docs?: QueryDocSnapshot[];
  }>;
  set: (ref: DocRef, data: Record<string, any>, options?: { merge?: boolean }) => void;
};

export function createFakeDb(store: Store) {
  const db = {
    collection: (name: string) => createCollectionRef([name], store),
    runTransaction: async (fn: (tx: Transaction) => Promise<void>) => {
      const tx: Transaction = {
        get: async (ref) => {
          if (ref.__type === "query") {
            const snapshot = await ref.get();
            return {
              exists: !snapshot.empty,
              data: () => ({}),
              docs: snapshot.docs,
            };
          }
          const data = store.get(ref.path);
          return {
            exists: data != null,
            data: () => data ?? {},
          };
        },
        set: (ref, data, options) => {
          const existing = store.get(ref.path) ?? {};
          const merged = options?.merge ? { ...existing, ...data } : data;
          store.set(ref.path, merged);
        },
      };
      await fn(tx);
    },
  };
  return db;
}

export function getStoreValue(store: Store, ref: DocRef) {
  return store.get(ref.path);
}

function createCollectionRef(pathSegments: string[], store: Store): CollectionRef {
  return {
    doc: (id: string) => createDocRef([...pathSegments, id], store),
    collection: (name: string) => createCollectionRef([...pathSegments, name], store),
    where: (field: string, _op: string, value: any) =>
      createQueryRef(pathSegments, field, value, store),
  };
}

function createDocRef(pathSegments: string[], store: Store): DocRef {
  return {
    __type: "doc",
    id: pathSegments[pathSegments.length - 1],
    path: pathSegments.join("/"),
    collection: (name: string) => createCollectionRef([...pathSegments, name], store),
    delete: async () => {
      store.delete(pathSegments.join("/"));
    },
  };
}

function createQueryRef(
  pathSegments: string[],
  field: string,
  value: any,
  store: Store
): QueryRef {
  const pathPrefix = pathSegments.join("/");
  return {
    __type: "query",
    pathPrefix,
    field,
    value,
    get: async () => buildQuerySnapshot(pathPrefix, field, value, store),
  };
}

async function buildQuerySnapshot(
  pathPrefix: string,
  field: string,
  value: any,
  store: Store
): Promise<QuerySnapshot> {
  const docs: QueryDocSnapshot[] = [];
  const prefix = `${pathPrefix}/`;
  for (const [path, data] of store.entries()) {
    if (!path.startsWith(prefix)) continue;
    if (data?.[field] !== value) continue;
    const id = path.split("/").pop() ?? "";
    docs.push({
      id,
      data: () => data,
    });
  }
  return { docs, empty: docs.length === 0 };
}
