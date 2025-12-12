const ViewMember = ({
  isOpen,
  onClose,
  member,
  handleEdit,
  viewAll = false,
}) => {

  const handleOutSideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-16 z-1000 dark:bg-crypto_violet/30 bg-pink-500/30 flex justify-end transition-all duration-300 ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleOutSideClick}
    >
      <div
        className={`bg-pink-200 dark:bg-sdl fixed top-0 right-0 font-jose w-[60vw] max-[915px]:w-[90vw] border-r-4 h-screen border-l-[10px] dark:border-crypto_violet border-pink-400 pl-2 md:pl-6 text-left flex flex-col items-start justify-start gap-6 transform transition-transform duration-300 ease-in-out overflow-y-auto py-10 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="h-[25.44px] rounded-lg whitespace-nowrap font-medium text-[18px]/4 flex items-center justify-center gap-1 px-1 pt-5 pb-3 cursor-pointer hover:bg-red-500 dark:bg-pink-300"
          onClick={() => {
            handleEdit(member);
            onClose();
          }}
        >
          Edit
        </button>
        {Object.entries(member || {})
          .filter(([key]) => !["_id"].includes(key))
          .map(([key, value], index) => {
            return (
              <div
                key={index}
                className="flex items-start justify-between gap-8 w-full resp"
              >
                <p className="font-normal text-[18px]/4 pb-[0.4rem] sm:w-[38vw] lg:w-[18vw] text-text_violet capitalize">
                  {key === "redirectionURL"
                    ? "Redirect Url"
                    : key.replace(/([A-Z])/g, " $1")}
                </p>

                {key === "complianceDocs" ? (
                  <>
                    <p
                      onClick={() => redirectToComplianceDocs(value)}
                      className="font-light text-[20px]/5 mb-[0.4rem] break-all text-wrap md:w-full rounded-md cursor-pointer underline"
                    >
                      {value ? "See Docs" : "N/A"}
                    </p>
                  </>
                ) : (
                  <p className="font-light text-[20px]/5 mb-[0.4rem] break-all text-wrap md:w-full rounded-md">
                    {value || "N/A"}
                  </p>
                )}
              </div>
            );
          })}
        <button title={"Close"} onClick={handleOutSideClick}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewMember;
