Rails.application.routes.draw do
  use_doorkeeper
  get 'home/index'
  get 'home/contact'

  resources :projects do 
    collection do 
      get :my_project
    end
  end

  devise_for :users, controllers: {
        sessions: 'users/sessions' , registrations: 'users/registrations'
      }

  devise_scope :user do
    root to: "users/sessions#new"
  end


  namespace :admin do
    get 'dashboard/index'
    resources :freelancers
    resources :clients 
  end

  namespace :api, defaults: {format: 'json'}do
    namespace :v1 do
      resources :projects
    end
  end

  # at the end of you routes.rb
  match '*a', :to => 'errors#routing', via: :get

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:

end
