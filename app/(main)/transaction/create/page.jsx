// import { headers } from "next/headers";
// import { getUserAccounts } from "@/actions/dashboard";
// import { getTransaction } from "@/actions/transaction";
// import { defaultCategories } from "@/data/categories";
// import { AddTransactionForm } from "../_components/transaction-form";

// export default async function AddTransactionPage() {
//   // Get full URL from referer header
//   const headersList = headers();
//   const referer = headersList.get("referer") || "http://localhost:3000";
//   const searchParams = new URL(referer).searchParams;

//   const editId = searchParams.get("edit");
//   const accounts = await getUserAccounts();

//   let initialData = null;
//   if (editId) {
//     initialData = await getTransaction(editId);
//   }

//   return (
//     <div className="max-w-3xl mx-auto px-5">
//       <div className="flex justify-center md:justify-normal mb-8">
//         <h1 className="text-5xl gradient-title">Add Transaction</h1>
//       </div>
//       <AddTransactionForm
//         accounts={accounts}
//         categories={defaultCategories}
//         editMode={!!editId}
//         initialData={initialData}
//       />
//     </div>
//   );
// }

import { headers } from "next/headers";
import { getUserAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";

export default async function AddTransactionPage() {
  const headersList = await headers(); // ✅ await required
  const fullUrl = headersList.get("x-invoke-path") || "http://localhost:3000";
  const searchParams = new URL(fullUrl, "http://localhost:3000").searchParams;

  const editId = searchParams.get("edit");
  const accounts = await getUserAccounts();

  let initialData = null;
  if (editId) {
    initialData = await getTransaction(editId);
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title">Add Transaction</h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}

