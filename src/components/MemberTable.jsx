import React from "react";

const MemberTable = ({ members, onView }) => {
  return (
    <div className="w-full py-4 my-2 overflow-x-auto bg-gray-800">
      <div className="min-w-max mx-auto bg-gray-600">
        <table className="min-w-[900px] w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border max-w-max">S.No.</th>
              <th className="p-3 border max-w-max">Name</th>
              <th className="p-3 border max-w-max">Email</th>
              <th className="p-3 border max-w-max">Profession</th>
              <th className="p-3 border max-w-max">Verified</th>
              <th className="p-3 border max-w-max">Active</th>
            </tr>
          </thead>

          <tbody className="">
            {members.map((member, index) => (
              <tr
                key={member._id}
                className="border-b hover:bg-gray-500"
                onClick={() => onView(member)}
              >
                <td className="p-3 border">{index + 1}</td>
                <td className="p-3 border">{member.fullName}</td>
                <td className="p-3 border">{member.email}</td>
                <td className="p-3 border">{member.profession}</td>

                {/* Verified badge */}
                <td className="p-3 border">
                  {member.isVerified ? (
                    <span className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded">
                      Yes
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded">
                      No
                    </span>
                  )}
                </td>

                {/* Active badge */}
                <td className="p-3 border">
                  {member.status === "active" ? (
                    <span className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded">
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberTable;
