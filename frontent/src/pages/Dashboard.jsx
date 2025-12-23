import React, { useEffect, useState } from "react";
import DashboardLayOut from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { LucideFilePlus } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATH } from "../utils/apiPath";
import { ResumeSummaryCard } from "../components/card";
import toast from 'react-hot-toast'
import moment from 'moment'
import Modal from "../components/Modal";
import CreateResumeForm from "../components/CreateResumeForm";
import { Trash2, X } from "lucide-react";


const Dashboard = () => {
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [allResumes, setAllResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const calculateCompletion = (resume) => {
    let completedFields = 0;
    let totalFields = 0;
  
    // profile info
    
    totalFields += 3;
    if (resume.profileInfo?.fullName) completedFields++;
    if (resume.profileInfo?.designation) completedFields++;
    if (resume.profileInfo?.summary) completedFields++;

    // Contact Info
    totalFields += 2;
    if (resume.contactInfo?.email) completedFields++;
    if (resume.contactInfo?.phone) completedFields++;

    // Work Experience
    resume.workExperience?.forEach((exp) => {
      totalFields += 5;
      if (exp.company) completedFields++;
      if (exp.role) completedFields++;
      if (exp.startDate) completedFields++;
      if (exp.endDate) completedFields++;
      if (exp.description) completedFields++;
    });

    // Education
    resume.education?.forEach((edu) => {
      totalFields += 4;
      if (edu.degree) completedFields++;
      if (edu.institution) completedFields++;
      if (edu.startDate) completedFields++;
      if (edu.endDate) completedFields++;
    });

    // Skills
    resume.skills?.forEach((skill) => {
      totalFields += 2;
      if (skill.name) completedFields++;
      if (skill.progress > 0) completedFields++;
    });

    // Projects
    resume.projects?.forEach((project) => {
      totalFields += 4;
      if (project.title) completedFields++;
      if (project.description) completedFields++;
      if (project.github) completedFields++;
      if (project.liveDemo) completedFields++;
    });

    // Certifications
    resume.certifications?.forEach((cert) => {
      totalFields += 3;
      if (cert.title) completedFields++;
      if (cert.issuer) completedFields++;
      if (cert.year) completedFields++;
    });

    // Languages
    resume.languages?.forEach((lang) => {
      totalFields += 2;
      if (lang.name) completedFields++;
      if (lang.progress > 0) completedFields++;
    });

    // Interests
    totalFields += resume.interests?.length || 0;
    completedFields +=
      resume.interests?.filter((i) => i?.trim() !== "")?.length || 0;

    return Math.round((completedFields / totalFields) * 100);
  };

  // Fetch all resumes
  const fetchAllResumes = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(API_PATH.RESUME.GET_All);

      // Add completion percentage to each resume
      const resumeWithCompletion = response.data.map((resume) => ({
        ...resume,
        completion: calculateCompletion(resume),
      }));
      setAllResumes(resumeWithCompletion);
    } catch (err) {
      console.error("Error fetching resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllResumes();
  }, []);

  const handleDeleteResme= async()=>{
       if(!resumeToDelete) return

       try{
        await axiosInstance.delete(API_PATH.RESUME.DELETE(resumeToDelete))
        toast.success("Resume deleted successfully")

        fetchAllResumes()
        

       }
       catch(error){
        console.error("error deleting resume:",error)
        toast.error("failed to delete resume")

       }

       finally{
            setResumeToDelete(null)
            setShowDeleteConfirm(false)

          }
       
  }

  const handleDeleteClick=(id)=>{
    setResumeToDelete(id);
    setShowDeleteConfirm(true)
  }

  return (
    <DashboardLayOut>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  My Resumes
                </h1>
                <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl">
                  {allResumes.length > 0
                    ? `You have ${allResumes.length} professional resume${
                        allResumes.length !== 1 ? "s" : ""
                      }. Manage and build your career portfolio.`
                    : "Create your first professional resume and start building your career journey."}
                </p>
              </div>
              {allResumes.length > 0 && (
                <button
                  className="group relative px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/50 active:scale-95"
                  onClick={() => setOpenCreateModal(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-3 text-sm sm:text-base">
                    Create New
                    <LucideFilePlus
                      className="group-hover:translate-x-1 transition-transform duration-300"
                      size={18}
                    />
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-violet-600 absolute top-0 left-0"></div>
              </div>
              <p className="mt-6 text-slate-600 font-medium">Loading your resumes...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && allResumes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-violet-100 to-fuchsia-100 p-6 sm:p-8 rounded-3xl shadow-lg">
                  <LucideFilePlus size={48} className="text-violet-600" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
                No Resumes Yet
              </h3>
              <p className="text-slate-600 max-w-md mb-8 text-base sm:text-lg leading-relaxed">
                Start building your professional resume today and take the first step towards landing your dream job.
              </p>
              <button
                className="group relative px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/50 active:scale-95 text-base sm:text-lg"
                onClick={() => setOpenCreateModal(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-3">
                  Create Your First Resume
                  <LucideFilePlus
                    className="group-hover:rotate-90 transition-transform duration-300"
                    size={20}
                  />
                </span>
              </button>
            </div>
          )}
          {/* Grid view */}
          {!loading && allResumes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              <div
                className="group flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 border-2 border-dashed border-violet-300 rounded-3xl p-8 sm:p-10 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20 hover:border-violet-500 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-violet-100 hover:via-fuchsia-100 hover:to-pink-100 min-h-[400px]"
                onClick={() => setOpenCreateModal(true)}
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <LucideFilePlus size={36} className="text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 text-center group-hover:text-violet-600 transition-colors">
                  Create New Resume
                </h3>
                <p className="text-slate-600 text-center text-sm sm:text-base font-medium">
                  Start building your career
                </p>
              </div>
              {allResumes.map((resume) => (
                <ResumeSummaryCard
                  key={resume._id}
                  imgUrl={resume.thumbnailLink}
                  title={resume.title}
                  createdAt={resume.createdAt}
                  updatedAt={resume.updatedAt}
                  onSelect={() => navigate(`/resume/${resume._id}`)}
                  onDelete={() => handleDeleteClick(resume._id)}
                  completion={resume.completion || 0}
                  isPremium={resume.isPremium}
                  isNew={moment().diff(moment(resume.createdAt), "days") < 7}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
        }}
        hideHeader
        hideCloseButton
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Create New Resume
            </h3>
            <button
              onClick={() => setOpenCreateModal(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <CreateResumeForm
            onSuccess={() => {
              setOpenCreateModal(false);
              fetchAllResumes();
            }}
          />
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Deletion"
        showActionBtn
        actionBtnText="Delete"
        actionBtnClassName="bg-red-600 hover:bg-red-700 text-white"
        onActionClick={handleDeleteResme}
      >
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-full">
                <Trash2 size={32} className="text-red-600" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              Delete Resume?
            </h3>
            <p className="text-slate-600 mb-6 max-w-md text-base leading-relaxed">
              Are you sure you want to delete this resume? This action cannot be undone and all your data will be permanently lost.
            </p>
          </div>
        </div>
      </Modal>


    </DashboardLayOut>
  );
};

export default Dashboard;
