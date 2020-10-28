import { Test, TestingModule } from '@nestjs/testing';
import { ActivationsResolver } from './activations.resolver';

describe('ActivationsResolver', () => {
  let resolver: ActivationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivationsResolver],
    }).compile();

    resolver = module.get<ActivationsResolver>(ActivationsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
