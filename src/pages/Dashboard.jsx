import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/AuthContext";
import Search from "../components/Search";
import { getAllMembers } from "../api/Admin";
import useDebounce from "../hooks/useDebounce";
import MemberTable from "../components/MemberTable";
import ViewMember from "../components/RightSideBar/ViewMember";
import EditMember from "../components/RightSideBar/EditMember";

const Dashboard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 800).toLowerCase();
  const { token, user } = useAuth();

  const filteredMembers = debouncedSearch
    ? members.filter(
        (member) =>
          member?.fullName?.toLowerCase().includes(debouncedSearch) ||
          member?.email?.toLowerCase().includes(debouncedSearch),
      )
    : members;
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getAllMembers(token, user._id);
        if (response.success) setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error.message);
      }
    };

    fetchMembers();
  }, [token]);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState({ view: false, member: null });
  const [selectedMember, setSelectedMember] = useState(null);

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedMember(null);
  };

  const handleEditMember = (currentMember) => {
    // Implement edit member logic here
    setIsEditOpen({ view: true, member: currentMember });
  };

  const handleMemberUpdate = (updatedMember) => {
    setMembers((prev) =>
      prev.map((m) => (m._id === updatedMember._id ? updatedMember : m)),
    );
  };

  const handleMemberDelete = (deletedMemberId) => {
    setMembers((prev) => prev.filter((m) => m._id !== deletedMemberId));
  };
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-orange-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col text-center md:text-left">
            <h1 className="text-lg md:text-3xl font-bold text-white tracking-tight">
              Member Dashboard
            </h1>
            <p className="text-gray-400 ">
              Manage and view all registered members
            </p>
          </div>

          <button
            className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-linear-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-400 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-900 shadow-lg shadow-orange-900/20"
            onClick={() => navigate("/dashboard/field")}
          >
            <span className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            Manage Custom Fields
          </button>
        </div>

        {/* Controls Section (Search) */}
        <div className="mb-6">
          <div className="relative max-w-md  flex items-start">
            <Search value={search} setSearch={setSearch} />
          </div>
        </div>
        {filteredMembers && filteredMembers.length > 0 && (
          <MemberTable members={filteredMembers} onView={handleViewMember} />
        )}

        <ViewMember
          isOpen={isViewOpen}
          onClose={handleCloseView}
          member={selectedMember}
          handleEdit={handleEditMember}
        />

        <EditMember
          isOpen={isEditOpen.view}
          onClose={() => setIsEditOpen({ view: false, member: null })}
          member={isEditOpen.member}
          onUpdate={handleMemberUpdate}
          onDelete={handleMemberDelete}
        />
      </div>
    </div>
  );
};

export default Dashboard;
