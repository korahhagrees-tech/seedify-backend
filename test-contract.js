const { contractService } = require('./dist/services/contractService');

async function testContractService() {
  console.log('Testing Contract Service...');
  
  try {
    // Test getting total seeds
    console.log('1. Testing getTotalSeeds...');
    const totalSeeds = await contractService.getTotalSeeds();
    console.log(`Total seeds: ${totalSeeds}`);
    
    if (totalSeeds > 0) {
      // Test getting a specific seed
      console.log('2. Testing getSeedData for seed 1...');
      const seedData = await contractService.getSeedData(1);
      console.log('Seed 1 data:', seedData);
      
      // Test getting all seeds (this might take a while)
      console.log('3. Testing getAllSeedsData...');
      const allSeeds = await contractService.getAllSeedsData();
      console.log(`Found ${allSeeds.length} seeds`);
      
      if (allSeeds.length > 0) {
        console.log('First seed:', allSeeds[0]);
      }
    } else {
      console.log('No seeds found, falling back to mock data');
    }
    
  } catch (error) {
    console.error('Error testing contract service:', error);
  }
}

testContractService();
