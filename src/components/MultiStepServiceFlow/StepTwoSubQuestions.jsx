import { ChoiceTermsViewer } from "../terms/TermsViewer";
import { QuestionInput } from "./QuestionInput";
import { Fragment } from "react";

export function StepTwoDetails({
  selectedChoices,
  answers,
  agreements,
  onAnswerChange,
  onAgreementChange,
}) {

  return (
    <>
      <div className="space-y-8 [counter-reset:roman-list]" role="list">
        {selectedChoices.map((choice, index) => {
          return (
            <Fragment key={choice._id}>
              <article role="listitem" className="">
                <h3 className="text-2xl border-b pb-3 mb-5 [counter-increment:roman-list] flex items-baseline">
                  <span
                    className="before:content-[counter(roman-list,upper-roman)'.'] 
                      before:text-white 
                     before:inline-block before:min-w-10 before:select-none"
                  />
                  <span>{choice.title}</span>
                </h3>

                <div className="border border-gray-200 p-6 rounded-xl shadow-sm">
                  {/* Questions Section */}
                  {/* Questions Section */}
                  {choice.questions.length > 0 && (
                    <section className="mb-6 space-y-4 ">
                      {choice.questions.map((q, index) => {
                        // Create a globally unique key for this specific service's question
                        const compositeKey = `${choice._id}_${q.id}_${index}`;
                        return (
                          <QuestionInput
                            key={compositeKey}
                            questionNumber={index + 1}
                            question={q}
                            value={answers[compositeKey] || ""}
                            onChange={(val) =>
                              onAnswerChange(compositeKey, val)
                            }
                          />
                        );
                      })}
                    </section>
                  )}

                  {/* Terms & PDF Section */}
                  <section className="space-y-4 rounded-lg">
                    <h4 className="font-semibold ">Terms & Conditions</h4>

                    <ChoiceTermsViewer
                      choice={choice}
                      agreement={agreements[choice._id]}
                      onAgreementChange={onAgreementChange}
                    />

                    <label className="flex items-start justify-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={!!agreements[choice._id]}
                        onChange={(e) =>
                          onAgreementChange(choice._id, e.target.checked)
                        }
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <p className=" font-medium select-none">
                        I have read and agree to the terms and conditions for{" "}
                        {choice.title}.
                      </p>
                    </label>
                  </section>
                </div>
              </article>
              <br />
              <hr />
            </Fragment>
          );
        })}
      </div>
    </>
  );
}
