import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function CropCard({ crop }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{crop.cropName}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {crop.plotName || "No plot name"}
          </p>
        </div>

        <StatusBadge status={crop.status} />
      </div>

      <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-400">
        <p>
          <span className="font-medium text-slate-800 dark:text-slate-200">Planted:</span>{" "}
          {new Date(crop.plantedDate).toLocaleDateString()}
        </p>
        <p>
          <span className="font-medium text-slate-800 dark:text-slate-200">Expected Harvest:</span>{" "}
          {new Date(crop.expectedHarvestDate).toLocaleDateString()}
        </p>
      </div>

      <Link
        to={`/crops/${crop._id}`}
        className="mt-4 inline-block rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white"
      >
        View Details
      </Link>
    </div>
  );
}

export default CropCard;