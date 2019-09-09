package google.registry.persistence;

import dagger.Component;
import google.registry.config.CredentialModule;
import google.registry.config.RegistryConfig.ConfigModule;
import google.registry.gcs.GcsServiceModule;
import google.registry.keyring.kms.KmsModule;
import google.registry.persistence.PersistenceModule.AppEnginEMF;
import google.registry.util.UtilsModule;
import javax.inject.Singleton;
import javax.persistence.EntityManagerFactory;

@Singleton
@Component(
    modules = {
      ConfigModule.class,
      CredentialModule.class,
      GcsServiceModule.class,
      KmsModule.class,
      PersistenceModule.class,
      UtilsModule.class
    })
public interface PersistenceComponent {
  @AppEnginEMF
  EntityManagerFactory appEngineEntityManagerFactory();
}
