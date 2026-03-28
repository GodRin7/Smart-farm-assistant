import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import StatusBadge from "../components/StatusBadge";
import { deleteCrop, getCropById } from "../api/cropApi";

function CropDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        const data = await getCropById(id);
        setCrop(data);
      } catch (error) {
        setError("Failed to load crop details");
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this crop?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteCrop(id);
      navigate("/crops");
    } catch (error) {
      setError("Failed to delete crop");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Crop Details">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          Loading crop details...
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Crop Details">
        <div className="rounded-3xl bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title="Crop Details"
      rightAction={
        <Link
          to={`/crops/${id}/edit`}
          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white"
        >
          Edit
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{crop.cropName}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {crop.variety || "No variety specified"}
              </p>
            </div>
            <StatusBadge status={crop.status} />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Plot Name:</span> {crop.plotName || "—"}
            </p>
            <p>
              <span className="font-medium">Area:</span> {crop.area || 0} {crop.areaUnit}
            </p>
            <p>
              <span className="font-medium">Date Planted:</span>{" "}
              {new Date(crop.plantedDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Expected Harvest Date:</span>{" "}
              {new Date(crop.expectedHarvestDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Actual Harvest Date:</span>{" "}
              {crop.actualHarvestDate
                ? new Date(crop.actualHarvestDate).toLocaleDateString()
                : "—"}
            </p>
            <p>
              <span className="font-medium">Notes:</span> {crop.notes || "—"}
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white"
        >
          {deleting ? "Deleting..." : "Delete Crop"}
        </button>
      </div>
    </MobileLayout>
  );
}

export default CropDetails;