Rails.application.routes.draw do
  root "todos#index"
  resources :todos
end

