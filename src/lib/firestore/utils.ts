import { FirebaseError } from "firebase/app";
import {
  collection,
  DocumentData,
  FieldPath,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
  WhereFilterOp,
} from "firebase/firestore";
import app from "@/lib/firebase";

const db = getFirestore(app);

export async function fetchDocuments(
  path: string,
  options: {
    where?: {
      fieldPath: string | FieldPath;
      opStr: WhereFilterOp;
      value: unknown;
    };
    limit: number;
  },
): Promise<DocumentData[]> {
  try {
    const data: DocumentData[] = [];
    const q = options?.where
      ? query(
          collection(db, path),
          where(
            options?.where.fieldPath,
            options?.where.opStr,
            options?.where.value,
          ),
          limit(options?.limit),
        )
      : query(collection(db, path), limit(options?.limit));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    return data;
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "permission-denied":
          throw new Error(
            "Permission denied. User does not have access to this data.",
          );
        case "not-found":
          throw new Error("Data not found.");
        default:
          throw new Error(`An error occurred: ${error.code}`);
      }
    } else {
      throw new Error(`An unknown error occurred: ${(error as Error).message}`);
    }
  }
}