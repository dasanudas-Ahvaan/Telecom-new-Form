import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/AuthContext";
import Search from "../components/Search";
import { getAllMembers } from "../api/Admin";
import useDebounce from "../hooks/useDebounce";
import MemberTable from "../components/MemberTable";
import ViewMember from "../components/RightSideBar/ViewMember";
import EditMember from "../components/RightSideBar/EditMember";
import Loader from "../components/Loader";
import { FilterButton } from "../components/FilterButton";
import Modal from "../components/Modal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("unverified");
  const [isLoading, setIsLoading] = useState(true);
  const [modalError, setModalError] = useState("");
  const [counts, setCounts] = useState({
    verified: 0,
    unverified: 0,
    inactive: 0,
  });

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
        setIsLoading(true);
        const response = await getAllMembers(token, user._id, filterType);
        if (response.success) {
          setMembers(response.data);
          setCounts((prev) => ({
            ...prev,
            [filterType]: response.data.length,
          }));
        }
      } catch (error) {
        setModalError(error.message+". Please login again");
        console.error("Error fetching members:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [token, filterType]); // Re-fetch when filterType changes

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
            <p className="text-gray-400">
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

        <div className="flex flex-wrap gap-3 mb-6">
          <FilterButton
            active={filterType === "unverified"}
            onClick={() => setFilterType("unverified")}
            count={counts.unverified}
            color="orange"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Unverified
          </FilterButton>

          <FilterButton
            active={filterType === "verified"}
            onClick={() => setFilterType("verified")}
            count={counts.verified}
            color="green"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Verified
          </FilterButton>

          <FilterButton
            active={filterType === "inactive"}
            onClick={() => setFilterType("inactive")}
            count={counts.inactive}
            color="red"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            Inactive
          </FilterButton>
        </div>
        {/* Controls Section (Search) */}
        <div className="mb-6">
          <div className="relative max-w-md flex items-start">
            <Search value={search} setSearch={setSearch} />
          </div>
        </div>
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : (
          <>
            {filteredMembers && filteredMembers.length > 0 ? (
              <MemberTable
                members={filteredMembers}
                onView={handleViewMember}
              />
            ) : (
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-400 font-medium">No members found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {debouncedSearch
                    ? "Try adjusting your search"
                    : `No ${filterType} members at the moment`}
                </p>
              </div>
            )}
          </>
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
      <Modal
        isOpen={modalError}
        onClose={() => setModalError("")}
        title={"Error Occured"}
        message={modalError}
        type={"error"}
        size="md"
        closeOnOverlay={modalError}
      />
    </div>
  );
};

export default Dashboard;
