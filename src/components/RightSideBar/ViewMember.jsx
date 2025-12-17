const ViewMember = ({
  isOpen,
  onClose,
  member,
  handleEdit,
}) => {
  const handleOutSideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-1000 dark:bg-crypto_violet/30 bg-gray-500/30 flex justify-end transition-all duration-300 ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleOutSideClick}
    >
      <div
        className={`bg-gray-200 dark:bg-sdl fixed top-0 right-0 font-jose w-[60vw] max-[915px]:w-[90vw] border-r-4 h-screen border-l-[10px] dark:border-crypto_violet border-gray-400 pl-2 md:pl-6 text-left flex flex-col items-start justify-start gap-6 transform transition-transform duration-300 ease-in-out overflow-y-auto py-10 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="h-[25.44px] rounded-lg whitespace-nowrap font-medium text-[18px]/4 flex items-center justify-center gap-1 px-1 pt-5 pb-3 cursor-pointer hover:bg-red-500 dark:bg-gray-300 text-white"
          onClick={() => {
            handleEdit(member);
            onClose();
          }}
        >
          Edit
        </button>
        {Object.entries(member || {})
          .filter(([key]) => !["_id", "extraFields"].includes(key))
          .map(([key, value], index) => {
            return (
              <div
                key={index}
                className="flex items-start justify-between gap-8 w-full resp"
              >
                <p className="font-normal text-[18px]/4 pb-[0.4rem] sm:w-[38vw] lg:w-[18vw] text-black capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>

                <p className="font-light text-[20px]/5 mb-[0.4rem] break-all text-black text-wrap md:w-full rounded-md">
                  {key === "dateOfBirth"
                    ? new Date(value).toDateString()
                    : key === "isVerified"
                    ? value
                      ? "Yes"
                      : "No"
                    : value || "N/A"}
                </p>
              </div>
            );
          })}
        {member &&
          member.extraFields &&
          Object.keys(member.extraFields).length > 0 && (
            <>
              <hr className="w-full border-gray-400" />
              <h2 className="text-2xl font-semibold mb-4">Extra Fields</h2>
              {Object.entries(member.extraFields).map(([key, value], index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-8 w-full resp"
                >
                  <p className="font-normal text-[18px]/4 pb-[0.4rem] sm:w-[38vw] lg:w-[18vw] text-black capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>

                  <p className="font-light text-[20px]/5 mb-[0.4rem] break-all text-black text-wrap md:w-full rounded-md">
                    {value || "N/A"}
                  </p>
                </div>
              ))}
            </>
          )}
        <button
          title={"Close"}
          onClick={handleOutSideClick}
          className="text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewMember;
