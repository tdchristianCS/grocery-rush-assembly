const margin = 10;
const fps = 60;
const refreshRate = 1_000 / fps;

const customerSize = 72;
const maxCustomers = 100;

const maxPatience = 30 * fps;

const minPatienceDrainRate = 1;
const maxPatienceDrainRate = 5;
const patienceDrainRateIncrement = 0.25;

const minCustomerSpeed = 1.5;
const maxCustomerSpeed = 3;
const customerSpeedIncrement = 0.02;

const minDesireChance = 33;
const maxDesireChance = 90;
const desireChanceIncrement = 0.5;

const slowestCustomerSpawnRate = 2_000;
const fastestCustomerSpawnRate = 1_000;
const customerSpawnRateIncrement = 25;
