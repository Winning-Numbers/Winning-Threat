const Transaction = ({ id }) => {
  return (
    <div className="grid grid-cols-3 gap-50 slate-800 text-gray-200 p-3 mt-2 mb-2 bg-slate-800 rounded-md">
      <p>{id}</p>
    </div>
  );
};

export default Transaction;
