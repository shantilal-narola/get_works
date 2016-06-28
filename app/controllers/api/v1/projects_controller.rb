class Api::V1::ProjectsController < ApplicationController
	
	 before_action :doorkeeper_authorize!
	respond_to :json

	def index
		respond_with Project.all
	end
end