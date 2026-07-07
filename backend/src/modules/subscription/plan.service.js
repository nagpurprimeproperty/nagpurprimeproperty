import planRepository from './plan.repository.js';

const planService = {
  listPlans: async (params) => planRepository.findAll(params),

  getPlan: async (id) => {
    const plan = await planRepository.findById(id);
    if (!plan) throw { status: 404, message: 'Plan not found' };
    return plan;
  },
 
};

export default planService;