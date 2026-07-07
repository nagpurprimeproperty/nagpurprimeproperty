import planRepository from './plan.repository.js';

const planService = {
  listPlans: async (params) => planRepository.findAll(params),

  getStats: async () => planRepository.getStats(),

  getPlan: async (id) => {
    const plan = await planRepository.findById(id);
    if (!plan) throw { status: 404, message: 'Plan not found' };
    return plan;
  },

  createPlan: async (payload) => {
    const existing = await planRepository.findByName(payload.name);
    if (existing) throw { status: 409, message: 'A plan with this name already exists' };
    return planRepository.create(payload);
  },

  updatePlan: async (id, payload) => {
    const plan = await planRepository.findById(id);
    if (!plan) throw { status: 404, message: 'Plan not found' };

    if (payload.name && payload.name !== plan.name) {
      const existing = await planRepository.findByName(payload.name);
      if (existing) throw { status: 409, message: 'A plan with this name already exists' };
    }

    return planRepository.updateById(id, payload);
  },

  deletePlan: async (id) => {
    const plan = await planRepository.findById(id);
    if (!plan) throw { status: 404, message: 'Plan not found' };
    return planRepository.deleteById(id);
  },

  toggleStatus: async (id) => {
    const plan = await planRepository.findById(id);
    if (!plan) throw { status: 404, message: 'Plan not found' };
    return planRepository.updateById(id, { isActive: !plan.isActive });
  },
};

export default planService;