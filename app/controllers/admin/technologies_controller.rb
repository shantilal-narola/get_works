class Admin::TechnologiesController < Admin::BaseController
	before_action :set_technology , only: [:show,:edit, :destroy , :update ]

	def index
		@admin_technologies = Technology.all
	end 

	def new
		@admin_technology = Technology.new	
	end

	def create
		@admin_technology = Technology.new(admin_technology_params)
		if @admin_technology.save
			redirect_to admin_technologies_path,:notice => "Technology is succefully created."
		else
			flash[:errors] = @admin_technology.errors.full_messages
			render :new 
		end	
	end 

	def show
	end

	def edit
	end

	def update 
		if @admin_technology.update_attributes(admin_technology_params)
			redirect_to admin_technologies_path , :notice => "Technology is succefully updated."
		else
			render :edit
		end
	end 

	def destroy
		if @admin_technology.destroy
			redirect_to admin_technologies_path , :notice => "Technology is succefully destroy."
		end
	end 

	private
	def set_technology
		@admin_technology = Technology.find(params[:id])
	end 

	def admin_technology_params
		params.require(:technology).permit(:name , :description )
	end

end  