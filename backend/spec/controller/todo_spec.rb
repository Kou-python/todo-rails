require 'rails_helper'

RSpec.describe TodosController, type: :controller do
  describe 'GET #index' do
    it 'returns a success response' do
      get :index
      expect(response).to be_successful
    end
  end

  describe 'POST #create' do
    context 'with valid parameters' do
      it 'creates a new Todo' do
        expect {
          post :create, params: { todo: { title: 'New Todo', is_completed: false } }
        }.to change(Todo, :count).by(1)
      end

      it 'renders a JSON response with the new todo' do
        post :create, params: { todo: { title: 'New Todo', is_completed: false } }
        expect(response).to have_http_status(:created)
      end
    end

    context 'with invalid parameters' do
      it 'does not create a new Todo' do
        expect {
          post :create, params: { todo: { title: '', is_completed: "false" } }
        }.to change(Todo, :count).by(0)
      end

      it 'renders a JSON response with errors' do
        post :create, params: { todo: { title: '', is_completed: false } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
