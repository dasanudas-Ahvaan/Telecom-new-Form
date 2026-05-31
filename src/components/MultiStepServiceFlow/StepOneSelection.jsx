export function StepOneSelection({ choices, selectedIds, onToggle }) {
  return (
    <fieldset className="space-y-4">
      <legend className="">
        Select one or more options. In the next step, you will be asked to
        answer a separate set of questions based on your selected options.
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(choices) &&
          choices.length > 0 &&
          choices.map((choice, index) => {
            const isSelected = selectedIds.includes(choice._id);
            // console.log("ccc", choice);
            return (
              <label
                key={choice._id}
                className={`flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    checked={isSelected}
                    onChange={() => onToggle(choice._id)}
                  />
                  <div>
                    <span className="block font-medium">{choice.title}</span>
                    <span className="block mt-1 text-sm">
                      {choice.description}
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
      </div>
    </fieldset>
  );
}
