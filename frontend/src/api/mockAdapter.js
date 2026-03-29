import MockAdapter from "axios-mock-adapter";

export function setupMockAdapter(API) {
  const mock = new MockAdapter(API, { delayResponse: 500 });

  // Dummy Data
  const user = { _id: "u123", name: "Farm Manager", email: "test@farm.com", token: "fake-jwt-token" };

  const crops = [
    { _id: "c1", cropName: "Tomatoes", plotName: "North Field", status: "active", expectedHarvestDate: new Date(Date.now() + 864000000).toISOString() },
    { _id: "c2", cropName: "Corn", plotName: "South Field", status: "active", expectedHarvestDate: new Date(Date.now() + 2592000000).toISOString() },
    { _id: "c3", cropName: "Lettuce", plotName: "Greenhouse", status: "harvested", expectedHarvestDate: new Date(Date.now() - 864000000).toISOString() },
  ];

  const activities = [
    { _id: "a1", activityType: "watering", crop: crops[0], date: new Date().toISOString() },
    { _id: "a2", activityType: "fertilizer_application", crop: crops[1], date: new Date(Date.now() - 86400000).toISOString() },
    { _id: "a3", activityType: "pest_control", crop: crops[0], date: new Date(Date.now() - 172800000).toISOString() },
  ];

  const expenses = [
    { _id: "e1", category: "seeds", crop: crops[0], amount: 1500, date: new Date(Date.now() - 2000000000).toISOString() },
    { _id: "e2", category: "fertilizer", crop: crops[1], amount: 3200, date: new Date(Date.now() - 100000000).toISOString() },
  ];

  const harvests = [
    { _id: "h1", crop: crops[2], yieldAmount: 500, quality: "A", date: new Date(Date.now() - 864000000).toISOString() },
  ];

  const dashboard = {
    summary: {
      activeCrops: 2,
      upcomingHarvestsCount: 1,
      totalExpenses: 4700,
      totalHarvestValue: 12500,
    },
    upcomingHarvests: [crops[0]],
    recentActivities: activities,
    latestExpenses: expenses,
  };

  // Auth
  mock.onPost("/auth/login").reply(200, user);
  mock.onPost("/auth/register").reply(200, user);

  // Dashboard
  mock.onGet("/dashboard").reply(200, dashboard);

  // Crops
  mock.onGet("/crops").reply((config) => {
    const params = new URLSearchParams(config.url.split("?")[1] || "");
    const status = params.get("status");
    if (status) return [200, crops.filter((c) => c.status === status)];
    return [200, crops];
  });
  mock.onGet(/\/crops\/.+/).reply(200, crops[0]);
  mock.onPost("/crops").reply(201, crops[0]);
  mock.onPut(/\/crops\/.+/).reply(200, crops[0]);
  mock.onDelete(/\/crops\/.+/).reply(200, { message: "Deleted" });

  // Activities
  mock.onGet(/\/activities.*/).reply(200, activities);
  mock.onPost("/activities").reply(201, activities[0]);
  mock.onDelete(/\/activities\/.+/).reply(200, { message: "Deleted" });

  // Expenses
  mock.onGet(/\/expenses.*/).reply(200, expenses);
  mock.onPost("/expenses").reply(201, expenses[0]);
  mock.onDelete(/\/expenses\/.+/).reply(200, { message: "Deleted" });

  // Harvests
  mock.onGet(/\/harvests.*/).reply(200, harvests);
  mock.onPost("/harvests").reply(201, harvests[0]);
  mock.onDelete(/\/harvests\/.+/).reply(200, { message: "Deleted" });

  console.log("🛠️ Mock Data Interceptor Enabled!");
}
