import { QuestionInput } from "./QuestionInput";

export function StepTwoDetails({
  selectedChoices,
  answers,
  agreements,
  onAnswerChange,
  onAgreementChange,
}) {
  return (
    <div className="space-y-8">
      {selectedChoices.map((choice) => (
        <article
          key={choice.id}
          className="p-6 border border-gray-200 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-bold  border-b pb-3 mb-5">
            {choice.title} - Requirements
          </h3>

          {/* Questions Section */}
          {choice.questions.length > 0 && (
            <section className="mb-6 space-y-4">
              <h4 className="font-semibold ">Required Information</h4>
              {choice.questions.map((q) => (
                <QuestionInput
                  key={q.id}
                  question={q}
                  value={answers[q.id] || ""}
                  onChange={(val) => onAnswerChange(q.id, val)}
                />
              ))}
            </section>
          )}

          {/* Terms & PDF Section */}
          <section className="space-y-4 rounded-lg">
            <h4 className="font-semibold ">Terms & Conditions</h4>
            <div className="h-48 md:h-64 w-full rounded border border-gray-300 overflow-hidden bg-white">
              <iframe
                src={`${choice.pdfUrl}#toolbar=0`}
                title={`Terms and Conditions for ${choice.title}`}
                className="w-full h-full"
              />
            </div>

            <label className="flex items-start justify-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={!!agreements[choice.id]}
                onChange={(e) => onAgreementChange(choice.id, e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <p className=" font-medium select-none">
                I have read and agree to the terms and conditions for{" "}
                {choice.title}.
              </p>
            </label>
          </section>
        </article>
      ))}
    </div>
  );
}
